# College Predictor model

`train_predictor.py` builds `public/ai/josaa-model-2026.json`, which the
**College Predictor** page (`/student/predictor`) loads in the browser.

## Data
JoSAA final-round opening and closing ranks, 2016–2024 (IITs, NITs, IIITs, GFTIs),
as exported from josaa.nic.in by
<https://github.com/PardhavMaradani/josaa-sql-interface/tree/main/csv>.
`institute_state.csv` maps each institute to its state (needed for home-state quota).

## Method
Closing ranks behave close to a random walk, so models that chase trends did worse
than "last year's cutoff" on held-out years. The model therefore:

1. centres each seat pool's forecast on its last closing rank, moved by the average
   yearly rise in cutoffs (`mu`);
2. fits gradient-boosted **quantile** trees (10th / 90th percentile) to learn how far the
   real cutoff strays from that for each kind of seat — its own volatility, size,
   category, quota, gender, institute type and history length (`s`);
3. turns that into a chance: `P(seat | rank r) = 1 / (1 + exp(-(mu - ln r) / s))`.

## Backtest (train only on earlier years)

| Forecast | Brier (lower is better) | "Last year's cutoff" rule | Same model, one spread for all seats | 80% range coverage |
|---|---|---|---|---|
| 2024 from data ≤ 2022 | **0.097** | 0.153 | 0.106 | 77.7% |
| 2024 from data ≤ 2023 | **0.089** | 0.122 | 0.097 | 72.8% |
| 2023 from data ≤ 2021 | **0.100** | 0.146 | 0.110 | 79.9% |

Calibration (2024, two years ahead): when the model said ~98% students got in 97% of
the time; ~83% → 86%; ~61% → 69%; ~31% → 38%; ~6% → 6%.

## Re-train
```bash
pip install pandas numpy scikit-learn
git clone --depth 1 https://github.com/PardhavMaradani/josaa-sql-interface
JOSAA_CSV_DIR=josaa-sql-interface/csv python ml/college-predictor/train_predictor.py public/ai
mv public/ai/josaa-model.json public/ai/josaa-model-2026.json
```
When newer JoSAA rounds are published, add them to `FILES`, bump `LAST_YEAR` /
`TARGET_YEAR` and re-run.
