"""
EDUING College Predictor — training + backtest.

Learns how JoSAA closing ranks move from one year to the next and how
uncertain that move is, for every seat pool
(institute, program, quota, category, gender).

Data: JoSAA final-round opening/closing ranks 2016–2024
(github.com/PardhavMaradani/josaa-sql-interface, exported from josaa.nic.in).

Model (chosen by backtest — closing ranks behave close to a random walk, so
trend-chasing models did worse than "last year's cutoff" on held-out years):
  centre  mu = log(last closing rank) + h * average yearly rise of cutoffs
  spread     gradient-boosted quantile trees (10th / 90th percentile) learn how far
             the real cutoff strays from mu for this kind of seat pool: its own
             volatility, size (opening→closing spread), category, quota, gender,
             institute type and how many years of history it has
  P(admit | rank r) = 1 / (1 + exp(-(mu - ln r) / s)),  s = (q90 - q10) / (2 ln 9)

Outputs a compact JSON the student portal loads, plus backtest metrics.

Run:  JOSAA_CSV_DIR=path/to/csv python train_predictor.py ../../public/ai
"""
import json, math, sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor

import os
HERE = Path(__file__).parent
# Folder with the josaa-<year>-r<round>-all.csv files from
# https://github.com/PardhavMaradani/josaa-sql-interface/tree/main/csv
CSV = Path(os.environ.get('JOSAA_CSV_DIR', HERE / 'data'))
FILES = {2016: '2016-r6', 2017: '2017-r7', 2018: '2018-r7', 2019: '2019-r7', 2020: '2020-r6',
         2021: '2021-r6', 2022: '2022-r6', 2023: '2023-r6', 2024: '2024-r5'}
KEY = ['institute', 'program', 'quota', 'category', 'gender']
TARGET_YEAR = 2026
LAST_YEAR = 2024
H_FINAL = TARGET_YEAR - LAST_YEAR  # 2 years ahead

# ── load ───────────────────────────────────────────────────────────────────
df = pd.concat([pd.read_csv(CSV / f'josaa-{v}-all.csv') for v in FILES.values()])
df['gender'] = df.gender.fillna('Gender-Neutral').replace('NA', 'Gender-Neutral')
df['program'] = df.program.str.replace(r'\s+', ' ', regex=True).str.strip()
df = df[(df.crank > 0) & (df.orank > 0)]
df = df.groupby(KEY + ['year'], as_index=False).agg(type=('type', 'first'), orank=('orank', 'min'), crank=('crank', 'max'))
df['lc'] = np.log(df.crank)
df['spread'] = np.log(df.crank / df.orank.clip(lower=1)).clip(0, 6)

wide = df.pivot_table(index=KEY, columns='year', values='lc')
spread = df.pivot_table(index=KEY, columns='year', values='spread')
orank = df.pivot_table(index=KEY, columns='year', values='orank')
types = df.groupby(KEY).type.last()
YEARS = sorted(FILES)

CATS = ['OPEN', 'EWS', 'OBC-NCL', 'SC', 'ST']
TYPES = ['IIT', 'NIT', '3IT', 'CFI']


def group_drift(base_year):
    """Median one-year log change of closing ranks by (type, category) ending at base_year."""
    if base_year - 1 not in wide.columns:
        return {}
    d = (wide[base_year] - wide[base_year - 1]).dropna()
    g = pd.DataFrame({'d': d, 'type': types.reindex(d.index).values,
                      'cat': [k[3] for k in d.index]})
    return g.groupby(['type', 'cat']).d.median().to_dict()


def features(base_year, h):
    """One row per seat pool that exists in base_year, using only data up to base_year."""
    hist = wide[[y for y in YEARS if y <= base_year]]
    have = hist[base_year].notna()
    hist = hist[have]
    L = hist[base_year]
    prev = hist[base_year - 1] if base_year - 1 in hist else pd.Series(np.nan, index=hist.index)
    prev2 = hist[base_year - 2] if base_year - 2 in hist else pd.Series(np.nan, index=hist.index)
    drift = group_drift(base_year)
    idx = hist.index
    cat = [k[3] for k in idx]
    f = pd.DataFrame(index=idx)
    f['L'] = L
    f['d1'] = (L - prev)
    f['d2'] = (prev - prev2)
    f['dev'] = hist.iloc[:, -4:].mean(axis=1) - L          # mean reversion vs last 4 yrs
    f['n'] = hist.notna().sum(axis=1)
    f['spread'] = spread.loc[idx, base_year]
    f['female'] = [k[4] != 'Gender-Neutral' for k in idx]
    f['pwd'] = ['PwD' in c for c in cat]
    for c in CATS:
        f['cat_' + c] = [c == x.replace(' (PwD)', '') for x in cat]
    t = types.reindex(idx).values
    for tt in TYPES:
        f['type_' + tt] = t == tt
    f['quota_home'] = [k[2] == 'HS' for k in idx]
    f['quota_ai'] = [k[2] == 'AI' for k in idx]
    f['gdrift'] = [drift.get((tt, c), drift.get((tt, c.replace(' (PwD)', '')), np.nan)) for tt, c in zip(t, cat)]
    f['h'] = h
    return f.astype(float)


def dataset(target_years, hs):
    X, y = [], []
    for T in target_years:
        for h in hs:
            b = T - h
            if b < YEARS[0] + 1 or T not in wide.columns:
                continue
            f = features(b, h)
            tgt = wide.loc[f.index, T]
            ok = tgt.notna()
            X.append(f[ok]); y.append((tgt - f['L'])[ok])
    return pd.concat(X), pd.concat(y)


YDRIFT = {y: float((wide[y] - wide[y - 1]).dropna().median()) for y in YEARS[1:]}


def drift_per_year(upto):
    """Average yearly rise of closing ranks seen up to `upto` (ranks inflate as seats and candidates grow)."""
    return float(np.mean([YDRIFT[t] for t in YEARS[1:] if t <= upto]))


def residual_dataset(targets, hs):
    """Residual of the drift-adjusted forecast; the trees learn how wide it is for each kind of seat."""
    X, y = [], []
    for T in targets:
        for h in hs:
            b = T - h
            if b < YEARS[0] + 1 or T not in wide.columns:
                continue
            f = features(b, h)
            tgt = wide.loc[f.index, T]
            ok = tgt.notna()
            base = f['L'] + h * drift_per_year(b)
            X.append(f[ok]); y.append((tgt - base)[ok])
    return pd.concat(X), pd.concat(y)


FEATS = None


def fit(X, y):
    common = dict(max_iter=250, learning_rate=0.05, max_leaf_nodes=15, min_samples_leaf=150, l2_regularization=3.0, random_state=0)
    lo = HistGradientBoostingRegressor(loss='quantile', quantile=0.1, **common).fit(X, y)
    hi = HistGradientBoostingRegressor(loss='quantile', quantile=0.9, **common).fit(X, y)
    q = np.quantile(y, [0.1, 0.5, 0.9])
    return lo, hi, q


def predict(models, X, base_year, h):
    lo, hi, q = models
    mu = X['L'].values + h * drift_per_year(base_year)
    a, b = lo.predict(X), hi.predict(X)
    s = np.maximum((b - a) / (2 * math.log(9)), 0.03)
    s_const = (q[2] - q[0]) / (2 * math.log(9))
    return mu, s, s_const


def prob(mu, s, logr):
    return 1 / (1 + np.exp(-(mu - logr) / s))


# ── backtest ───────────────────────────────────────────────────────────────
def backtest(test_year, h):
    """Train only on what was known by (test_year - h), forecast test_year, compare with what happened."""
    b = test_year - h
    X, y = residual_dataset([t for t in YEARS if t <= b], [1, 2])   # no label later than the base year
    models = fit(X, y)
    Xt = features(b, h)
    actual = wide.loc[Xt.index, test_year]
    ok = actual.notna()
    Xt, actual = Xt[ok], actual[ok].values
    mu, s, s_const = predict(models, Xt, b, h)
    naive = Xt['L'].values
    err_m = np.abs(np.exp(mu - actual) - 1)
    err_n = np.abs(np.exp(naive - actual) - 1)
    k9 = math.log(9)
    cover = ((actual >= mu - s * k9) & (actual <= mu + s * k9)).mean()
    cover_c = ((actual >= mu - s_const * k9) & (actual <= mu + s_const * k9)).mean()

    # Simulated applicants: 9 ranks per seat pool, log-uniform between 0.5x and 2x the last known cutoff
    rng = np.random.default_rng(0)
    logr = np.concatenate([naive + rng.uniform(math.log(0.5), math.log(2), len(Xt)) for _ in range(9)])
    A, M, S, N = (np.tile(v, 9) for v in (actual, mu, s, naive))
    truth = logr <= A
    p = prob(M, S, logr)
    pc = prob(M, s_const, logr)
    pn = (logr <= N).astype(float)
    acc = lambda q: round(float(((q >= 0.5) == truth).mean()) * 100, 1)
    brier = lambda q: round(float(((q - truth) ** 2).mean()), 4)
    bands = []
    for lo_, hi_, label in [(0, .2, 'Unlikely'), (.2, .45, 'Reach'), (.45, .75, 'Target'), (.75, .9, 'Likely'), (.9, 1.01, 'Safe')]:
        m = (p >= lo_) & (p < hi_)
        bands.append({'band': label, 'predicted': round(float(p[m].mean()) * 100), 'actual': round(float(truth[m].mean()) * 100), 'n': int(m.sum())})
    return {
        'testYear': test_year, 'horizonYears': h, 'trainedOn': f'{YEARS[0]}–{b}', 'seatPools': int(len(Xt)), 'applicants': int(len(truth)),
        'cutoffErrorMedianPct': round(float(np.median(err_m)) * 100, 1),
        'cutoffErrorMedianPctNaive': round(float(np.median(err_n)) * 100, 1),
        'interval80Coverage': round(float(cover) * 100, 1),
        'interval80CoverageConstant': round(float(cover_c) * 100, 1),
        'admitAccuracy': acc(p), 'admitAccuracyNaive': acc(pn), 'admitAccuracyConstant': acc(pc),
        'brier': brier(p), 'brierNaive': brier(pn), 'brierConstant': brier(pc),
        'calibration': bands,
    }


if __name__ == '__main__':
    out_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / 'out'
    out_dir.mkdir(parents=True, exist_ok=True)

    bts = [backtest(2024, 2), backtest(2024, 1), backtest(2023, 2)]
    for b in bts:
        print(json.dumps({k: v for k, v in b.items() if k != 'calibration'}))
        print('   ', b['calibration'])

    # ── final model: everything up to 2024, forecast 2026 ──────────────────
    X, y = residual_dataset(YEARS, [1, 2])
    models = fit(X, y)
    Xf = features(LAST_YEAR, H_FINAL)
    mu, s, _ = predict(models, Xf, LAST_YEAR, H_FINAL)

    states = pd.read_csv(HERE / 'institute_state.csv', index_col=0).State.to_dict()
    inst = sorted({k[0] for k in Xf.index}); prog = sorted({k[1] for k in Xf.index})
    ii = {v: i for i, v in enumerate(inst)}; pi = {v: i for i, v in enumerate(prog)}
    hist_years = YEARS[-5:]
    seats = []
    for (k, m, sd) in zip(Xf.index, mu, s):
        hist = [None if pd.isna(wide.loc[k, yy]) else int(round(math.exp(wide.loc[k, yy]))) for yy in hist_years]
        seats.append([ii[k[0]], pi[k[1]], k[2], k[3], 1 if k[4] != 'Gender-Neutral' else 0,
                      round(float(m), 4), round(float(sd), 4), hist, int(orank.loc[k, LAST_YEAR])])
    model = {
        'version': 1,
        'targetYear': TARGET_YEAR,
        'dataYears': [YEARS[0], LAST_YEAR],
        'histYears': hist_years,
        'source': 'JoSAA final-round opening & closing ranks, 2016–2024 (josaa.nic.in)',
        'method': 'Each seat pool\'s last closing rank, moved by the average yearly rise in closing ranks; gradient-boosted quantile trees then learn how far the real cutoff strays from that for this kind of seat (its own volatility, size, category, quota, gender, institute type), which sets the spread of the chance curve.',
        'driftPerYear': round(drift_per_year(LAST_YEAR), 4),
        'institutes': [[n, types.get(next(k for k in Xf.index if k[0] == n)), states.get(n, '')] for n in inst],
        'programs': prog,
        'cols': ['inst', 'prog', 'quota', 'category', 'female', 'mu', 's', 'hist', 'orankLast'],
        'seats': seats,
        'backtest': bts,
    }
    (out_dir / 'josaa-model.json').write_text(json.dumps(model, separators=(',', ':'), ensure_ascii=False))
    print('seats', len(seats), 'bytes', (out_dir / 'josaa-model.json').stat().st_size)
