'use client'

// College Predictor — the student's chances at every JoSAA program for the next
// counselling, forecast from nine years of real cutoffs, plus a choice-filling
// list built from those chances and the student's own preferences.
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { ChevronDown, Loader2, Copy, Save, Search, Info, ArrowUp, ArrowDown, X } from 'lucide-react'
import { auth, db } from '@/lib/firebase/config'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useToast } from '@/hooks/useToast'
import {
  loadPredictorModel, predict, buildChoicePlan, BANDS, BRANCH_GROUPS, INDIAN_STATES, INSTITUTE_TYPE_LABEL,
  type PredictorModel, type PredictorInput, type Prediction, type Category, type BandKey, type BranchKey,
  type InstituteType, type ChoicePrefs, type ChoiceItem,
} from '@/lib/ai/collegePredictor'

const CARD = 'rounded-[24px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]'
const CATEGORIES: Category[] = ['OPEN', 'EWS', 'OBC-NCL', 'SC', 'ST']
const TYPES: InstituteType[] = ['IIT', 'NIT', '3IT', 'CFI']
const TABS = [{ key: 'chances', label: 'My chances' }, { key: 'list', label: 'Choice list' }, { key: 'model', label: 'How accurate is it?' }] as const
type Tab = typeof TABS[number]['key']

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN')
const pct = (p: number) => (p >= 0.995 ? '>99%' : p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`)

const shortInstitute = (n: string) => n
  .replace('Indian Institute of Technology', 'IIT')
  .replace('National Institute of Technology', 'NIT')
  .replace('Indian Institute of Information Technology', 'IIIT')
  .replace(/^IIT \(BHU\)/, 'IIT BHU')
  .replace(/\s+,/g, ',')
function splitProgram(p: string) {
  const m = p.match(/^(.*?)\s*\(([^()]*(?:\([^()]*\))?[^()]*)\)\s*$/)
  const name = (m ? m[1] : p).trim()
  const detail = m ? m[2].replace('Bachelor of Technology', 'B.Tech').replace('Bachelor and Master of Technology (Dual Degree)', 'B.Tech + M.Tech').replace('Bachelor of Science', 'B.S.').replace('Integrated Master of Science', 'Integrated M.Sc.').replace('Bachelor of Architecture', 'B.Arch') : ''
  return { name, detail }
}

const BAND_STYLE: Record<BandKey, string> = {
  safe: 'bg-[color-mix(in_srgb,var(--green)_14%,transparent)] text-[var(--green)]',
  likely: 'bg-[color-mix(in_srgb,var(--green)_9%,transparent)] text-[var(--green)]',
  target: 'bg-[var(--gold-bg)] text-[var(--gold)]',
  reach: 'bg-[var(--accent-bg)] text-[var(--accent)]',
  unlikely: 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
}
const BAR_COLOR: Record<BandKey, string> = { safe: 'var(--green)', likely: 'var(--green)', target: 'var(--gold)', reach: 'var(--accent)', unlikely: 'var(--border-hover)' }
const ROLE_STYLE = { dream: BAND_STYLE.reach, target: BAND_STYLE.target, safe: BAND_STYLE.safe }

type FormState = { category: Category; female: boolean; homeState: string; mainCrl: string; mainCat: string; advCrl: string; advCat: string }

function toInput(f: FormState): PredictorInput {
  const n = (v: string) => { const x = Number(String(v).replace(/[,\s]/g, '')); return x > 0 ? Math.round(x) : undefined }
  return { category: f.category, female: f.female, homeState: f.homeState, mainCrl: n(f.mainCrl), mainCat: f.category === 'OPEN' ? undefined : n(f.mainCat), advCrl: n(f.advCrl), advCat: f.category === 'OPEN' ? undefined : n(f.advCat) }
}

// ── small pieces ───────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[5px]">
      <span className="text-[12.5px] font-semibold text-[var(--text-secondary)]">{label}</span>
      {children}
      {hint && <span className="text-[11.5px] text-[var(--text-muted)]">{hint}</span>}
    </label>
  )
}
const INPUT = 'h-[42px] w-full rounded-[14px] border border-[var(--border)] bg-[var(--bg)] px-[12px] text-[14px] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)]'

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`h-[32px] rounded-full border px-[12px] text-[12.5px] font-semibold transition ${active ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'}`}>
      {children}
    </button>
  )
}

/** Past closing ranks, the forecast with its likely range, and the student's rank. Lower = harder. */
function CutoffChart({ p, years, target }: { p: Prediction; years: number[]; target: number }) {
  const W = 300, H = 120, PADL = 18, PADR = 18, PADT = 14, PADB = 22
  const pts = p.history.map((v, i) => ({ x: years[i], v })).filter((d): d is { x: number; v: number } => !!d.v)
  const all = [...pts.map(d => d.v), p.low, p.high, p.rankUsed]
  const lo = Math.log(Math.min(...all) * 0.9), hi = Math.log(Math.max(...all) * 1.1)
  const xs = [...years, target]
  const X = (yr: number) => PADL + ((xs.indexOf(yr)) / (xs.length - 1)) * (W - PADL - PADR)
  const Y = (v: number) => PADT + ((Math.log(v) - lo) / (hi - lo)) * (H - PADT - PADB)
  const path = pts.map((d, i) => `${i ? 'L' : 'M'}${X(d.x).toFixed(1)},${Y(d.v).toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[340px]" role="img" aria-label={`Closing ranks ${pts.map(d => `${d.x}: ${fmt(d.v)}`).join(', ')}; forecast ${target}: ${fmt(p.cutoff)}; your rank ${fmt(p.rankUsed)}`}>
      <line x1={PADL - 14} x2={W - 4} y1={Y(p.rankUsed)} y2={Y(p.rankUsed)} stroke="var(--accent)" strokeDasharray="4 4" strokeWidth="1.2" />
      <text x={PADL - 14} y={Y(p.rankUsed) + (Y(p.rankUsed) > H / 2 ? -4 : 12)} textAnchor="start" fontSize="10" fill="var(--accent)" fontWeight="600">Your rank {fmt(p.rankUsed)}</text>
      <rect x={X(target) - 7} y={Y(p.low)} width="14" height={Math.max(2, Y(p.high) - Y(p.low))} rx="7" fill="var(--gold)" opacity="0.22" />
      {last && <line x1={X(last.x)} y1={Y(last.v)} x2={X(target)} y2={Y(p.cutoff)} stroke="var(--gold)" strokeDasharray="3 3" strokeWidth="1.5" />}
      <path d={path} fill="none" stroke="var(--text-primary)" strokeWidth="1.8" />
      {pts.map(d => <circle key={d.x} cx={X(d.x)} cy={Y(d.v)} r="3" fill="var(--bg-card)" stroke="var(--text-primary)" strokeWidth="1.6" />)}
      <circle cx={X(target)} cy={Y(p.cutoff)} r="4" fill="var(--gold)" />
      {xs.map(yr => <text key={yr} x={X(yr)} y={H - 6} textAnchor="middle" fontSize="10" fill={yr === target ? 'var(--gold)' : 'var(--text-muted)'} fontWeight={yr === target ? 700 : 400}>{yr}</text>)}
    </svg>
  )
}

function ChanceRow({ p, years, target, open, onToggle }: { p: Prediction; years: number[]; target: number; open: boolean; onToggle: () => void }) {
  const { name, detail } = splitProgram(p.program)
  return (
    <li className="border-b border-[var(--border)] last:border-0">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-[14px] px-[18px] py-[14px] text-left transition hover:bg-[var(--bg-card-hover)]">
        <div className="w-[64px] shrink-0 text-right">
          <p className="font-display text-[20px] font-bold leading-none" style={{ color: BAR_COLOR[p.band] === 'var(--border-hover)' ? 'var(--text-muted)' : BAR_COLOR[p.band] }}>{pct(p.chance)}</p>
          <div className="mt-[6px] h-[4px] overflow-hidden rounded-full bg-[var(--bg-subtle)]"><div className="h-full rounded-full" style={{ width: `${Math.max(3, p.chance * 100)}%`, background: BAR_COLOR[p.band] }} /></div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold">{name}</p>
          <p className="truncate text-[12.5px] text-[var(--text-muted)]">{shortInstitute(p.institute)}{detail ? ` · ${detail}` : ''}</p>
        </div>
        <div className="hidden shrink-0 text-right text-[12px] text-[var(--text-muted)] sm:block">
          <p>Forecast cutoff</p>
          <p className="font-semibold text-[var(--text-primary)]">{fmt(p.cutoff)}</p>
        </div>
        <span className={`hidden shrink-0 rounded-full px-[10px] py-[3px] text-[11.5px] font-bold md:inline ${BAND_STYLE[p.band]}`}>{BANDS.find(b => b.key === p.band)!.label}</span>
        <ChevronDown size={16} className={`shrink-0 text-[var(--text-muted)] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="grid gap-[16px] px-[18px] pb-[18px] md:grid-cols-[minmax(0,1fr)_340px]">
              <ul className="flex flex-col gap-[6px] text-[13px] text-[var(--text-secondary)]">
                {p.why.map((w, i) => <li key={i} className="flex gap-[8px]"><span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--text-faint)]" />{w}</li>)}
              </ul>
              <CutoffChart p={p} years={years} target={target} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

// ── page ───────────────────────────────────────────────────────────────────
export default function PredictorPage() {
  const { profile, loading } = useStudentData()
  const { toast } = useToast()
  const [model, setModel] = useState<PredictorModel | null>(null)
  const [modelError, setModelError] = useState('')
  const [form, setForm] = useState<FormState>({ category: 'OPEN', female: false, homeState: '', mainCrl: '', mainCat: '', advCrl: '', advCat: '' })
  const [submitted, setSubmitted] = useState<PredictorInput | null>(null)
  const [formError, setFormError] = useState('')
  const [tab, setTab] = useState<Tab>('chances')
  const [band, setBand] = useState<BandKey | 'all'>('all')
  const [branch, setBranch] = useState<BranchKey | 'all'>('all')
  const [types, setTypes] = useState<InstituteType[]>(TYPES)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'best' | 'chance'>('best')
  const [openId, setOpenId] = useState<string | null>(null)
  const [limit, setLimit] = useState(40)
  const [prefs, setPrefs] = useState<ChoicePrefs>({ branches: ['cse', 'ece', 'ee'], types: TYPES, preferHomeState: false, ambition: 'balanced', focus: 'balanced' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadPredictorModel().then(setModel).catch(e => setModelError(e?.message || 'Could not load the predictor.')) }, [])

  // prefill from what the student saved before, else from their profile
  const [prefilled, setPrefilled] = useState(false)
  useEffect(() => {
    if (loading || prefilled || !profile) return
    const saved = (profile as any).predictorInput as (PredictorInput & { prefs?: ChoicePrefs }) | undefined
    const cat = String((profile as any).category || '').toUpperCase()
    const guessCat: Category = cat.includes('OBC') ? 'OBC-NCL' : cat.includes('EWS') ? 'EWS' : cat === 'SC' ? 'SC' : cat === 'ST' ? 'ST' : 'OPEN'
    const state = (profile as any).domicileState || (profile as any).state || ''
    if (saved) {
      const f: FormState = { category: saved.category, female: !!saved.female, homeState: saved.homeState || state, mainCrl: saved.mainCrl ? String(saved.mainCrl) : '', mainCat: saved.mainCat ? String(saved.mainCat) : '', advCrl: saved.advCrl ? String(saved.advCrl) : '', advCat: saved.advCat ? String(saved.advCat) : '' }
      setForm(f)
      if (saved.prefs) setPrefs(p => ({ ...p, ...saved.prefs }))
      setSubmitted(toInput(f))
    } else {
      setForm(f => ({ ...f, category: guessCat, female: /^f/i.test(String((profile as any).gender || '')), homeState: INDIAN_STATES.includes(state) ? state : '' }))
    }
    setPrefilled(true)
  }, [loading, profile, prefilled])

  const preds = useMemo(() => (model && submitted ? predict(model, submitted) : []), [model, submitted])
  const counts = useMemo(() => { const c: Record<string, number> = {}; preds.forEach(p => { c[p.band] = (c[p.band] ?? 0) + 1 }); return c }, [preds])
  const shown = useMemo(() => preds.filter(p =>
    (band === 'all' || p.band === band) && (branch === 'all' || p.branch === branch) && types.includes(p.instituteType)
    && (!q || `${p.institute} ${p.program}`.toLowerCase().includes(q.toLowerCase())))
    // most sought-after programs first among those within reach (20%+), then highest chance
    .sort((a, b) => sort === 'chance'
      ? b.chance - a.chance || b.popularity - a.popularity
      : Number(b.chance >= 0.2) - Number(a.chance >= 0.2) || b.popularity - a.popularity), [preds, band, branch, types, q, sort])
  const plan = useMemo(() => (submitted && preds.length ? buildChoicePlan(preds, prefs, submitted.homeState) : null), [preds, prefs, submitted])

  const run = (e?: React.FormEvent) => {
    e?.preventDefault()
    const input = toInput(form)
    if (!input.homeState) return setFormError('Choose your home state — NIT seats depend on it.')
    if (!input.mainCrl && !input.advCrl) return setFormError('Enter at least your JEE Main rank.')
    if (input.category !== 'OPEN' && input.mainCrl && !input.mainCat) return setFormError(`Enter your JEE Main ${input.category} rank too — reserved seats go by category rank.`)
    setFormError(''); setSubmitted(input); setLimit(40); setOpenId(null)
  }

  const saveToProfile = async () => {
    const uid = auth.currentUser?.uid
    if (!uid || !submitted) return
    setSaving(true)
    try {
      const clean = Object.fromEntries(Object.entries({ ...submitted, prefs }).filter(([, v]) => v !== undefined))
      const top = plan?.expectedTop
      await updateDoc(doc(db, 'users', uid), {
        predictorInput: clean,
        predictorSummary: {
          safe: (counts.safe ?? 0) + (counts.likely ?? 0), target: counts.target ?? 0, reach: counts.reach ?? 0,
          likelySeat: top ? `${splitProgram(top.program).name} · ${shortInstitute(top.institute)}` : '',
          anySeat: plan ? Math.round(plan.anySeat * 100) : null, updatedAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      })
      toast.success('Saved. Your ranks and choice list will be here next time.')
    } catch { toast.error('Could not save — check your connection and try again.') }
    finally { setSaving(false) }
  }

  const copyList = async () => {
    if (!plan) return
    const text = plan.list.map((c, i) => `${i + 1}. ${shortInstitute(c.institute)} — ${c.program} (${c.quota}, ${c.seatCategory}${c.femaleOnly ? ', female-only' : ''}) · chance ${pct(c.chance)}`).join('\n')
    try { await navigator.clipboard.writeText(text); toast.success('Choice list copied.') } catch { toast.error('Copy failed — select the list and copy it manually.') }
  }

  const moveBranch = (k: BranchKey, dir: -1 | 1) => setPrefs(p => {
    const b = [...p.branches]; const i = b.indexOf(k); const j = i + dir
    if (i < 0 || j < 0 || j >= b.length) return p
    ;[b[i], b[j]] = [b[j], b[i]]; return { ...p, branches: b }
  })
  const toggleBranch = (k: BranchKey) => setPrefs(p => ({ ...p, branches: p.branches.includes(k) ? p.branches.filter(x => x !== k) : [...p.branches, k] }))
  const toggleType = (t: InstituteType, list: InstituteType[], set: (v: InstituteType[]) => void) => set(list.includes(t) ? (list.length > 1 ? list.filter(x => x !== t) : list) : [...list, t])

  const target = model?.targetYear ?? 2026
  const bt = model?.backtest?.[0]

  return (
    <div className="page-in mx-auto flex w-full max-w-[1180px] flex-col gap-[20px] pb-[48px]">
      <header className="flex flex-col gap-[6px]">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em]">College Predictor</h1>
        <p className="max-w-[680px] text-[14px] text-[var(--text-muted)]">
          Your chance at every JoSAA program in the {target} counselling — IITs, NITs, IIITs and GFTIs — forecast from {model ? `${model.dataYears[0]}–${model.dataYears[1]}` : 'nine years of'} real closing ranks.
          {bt && <> Tested on {bt.testYear}: when it said 90% or more, students got in {bt.calibration.find(c => c.band === 'Safe')?.actual}% of the time.</>}
        </p>
      </header>

      <div className="grid items-start gap-[20px] lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ranks form */}
        <form onSubmit={run} className={`${CARD} flex flex-col gap-[14px] p-[20px] lg:sticky lg:top-[88px]`} aria-label="Your ranks">
          <h2 className="font-display text-[16px] font-bold">Your ranks</h2>
          <div className="grid grid-cols-2 gap-[10px]">
            <Field label="Category">
              <select className={INPUT} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'OPEN' ? 'General (OPEN)' : c}</option>)}
              </select>
            </Field>
            <Field label="Gender">
              <select className={INPUT} value={form.female ? 'f' : 'm'} onChange={e => setForm(f => ({ ...f, female: e.target.value === 'f' }))}>
                <option value="m">Male</option><option value="f">Female</option>
              </select>
            </Field>
          </div>
          <Field label="Home state" hint="NITs keep half their seats for students from their own state.">
            <select className={INPUT} value={form.homeState} onChange={e => setForm(f => ({ ...f, homeState: e.target.value }))}>
              <option value="">Choose…</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="JEE Main rank (CRL)">
            <input className={INPUT} inputMode="numeric" placeholder="e.g. 24500" value={form.mainCrl} onChange={e => setForm(f => ({ ...f, mainCrl: e.target.value }))} />
          </Field>
          {form.category !== 'OPEN' && (
            <Field label={`JEE Main ${form.category} rank`}>
              <input className={INPUT} inputMode="numeric" placeholder="Category rank" value={form.mainCat} onChange={e => setForm(f => ({ ...f, mainCat: e.target.value }))} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-[10px]">
            <Field label="JEE Advanced rank">
              <input className={INPUT} inputMode="numeric" placeholder="Optional" value={form.advCrl} onChange={e => setForm(f => ({ ...f, advCrl: e.target.value }))} />
            </Field>
            {form.category !== 'OPEN' && (
              <Field label={`Adv. ${form.category} rank`}>
                <input className={INPUT} inputMode="numeric" placeholder="Optional" value={form.advCat} onChange={e => setForm(f => ({ ...f, advCat: e.target.value }))} />
              </Field>
            )}
          </div>
          {formError && <p role="alert" className="rounded-[12px] bg-[color-mix(in_srgb,var(--red)_10%,transparent)] px-[12px] py-[8px] text-[12.5px] text-[var(--red)]">{formError}</p>}
          <button type="submit" disabled={!model} className="inline-flex h-[44px] items-center justify-center gap-[8px] rounded-full bg-[var(--accent)] text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {!model && !modelError ? <><Loader2 size={15} className="animate-spin" /> Loading 9 years of cutoffs…</> : 'Show my chances'}
          </button>
          {modelError && <p role="alert" className="text-[12.5px] text-[var(--red)]">{modelError}</p>}
          <p className="text-[11.5px] leading-[1.5] text-[var(--text-muted)]">IIT seats use your Advanced rank, everything else your Main rank. PwD seats, B.Arch/B.Plan at NITs and the J&amp;K, Ladakh and Goa quotas are not covered yet.</p>
        </form>

        {/* results */}
        <section className="flex min-w-0 flex-col gap-[14px]">
          <div role="tablist" aria-label="Predictor views" className="flex w-fit gap-[4px] rounded-full border border-[var(--border)] bg-[var(--bg-card)] p-[4px]">
            {TABS.map(t => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                className={`h-[34px] rounded-full px-[14px] text-[13px] font-semibold transition ${tab === t.key ? 'bg-[var(--text-primary)] text-[var(--bg)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}>{t.label}</button>
            ))}
          </div>

          {tab !== 'model' && !submitted && (
            <div className={`${CARD} flex flex-col gap-[8px] p-[28px]`}>
              <p className="font-display text-[18px] font-bold">Enter your ranks to see where you stand</p>
              <p className="max-w-[520px] text-[13.5px] text-[var(--text-muted)]">You will get a chance for each program, the reasoning behind it, and a choice-filling list in the right order for JoSAA. Nothing is shared with universities.</p>
            </div>
          )}

          {/* ── chances ── */}
          {tab === 'chances' && submitted && (
            <>
              <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-5">
                {BANDS.map(b => (
                  <button key={b.key} onClick={() => setBand(band === b.key ? 'all' : b.key)} aria-pressed={band === b.key}
                    className={`${CARD} p-[14px] text-left transition ${band === b.key ? 'ring-2 ring-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}`}>
                    <p className="text-[12.5px] text-[var(--text-muted)]">{b.label} <span className="text-[11px]">{b.key === 'unlikely' ? '<20%' : b.key === 'safe' ? '90%+' : b.key === 'likely' ? '75–90%' : b.key === 'target' ? '45–75%' : '20–45%'}</span></p>
                    <p className="font-display text-[24px] font-bold">{counts[b.key] ?? 0}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-[8px]">
                <label className="flex h-[36px] min-w-[200px] flex-1 items-center gap-[8px] rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-[12px]">
                  <Search size={14} className="text-[var(--text-muted)]" />
                  <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search institute or branch" aria-label="Search programs" className="w-full bg-transparent text-[13px] outline-none" />
                </label>
                <select value={branch} onChange={e => setBranch(e.target.value as any)} aria-label="Branch" className="h-[36px] rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-[12px] text-[13px]">
                  <option value="all">All branches</option>
                  {BRANCH_GROUPS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                </select>
                <select value={sort} onChange={e => setSort(e.target.value as any)} aria-label="Sort" className="h-[36px] rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-[12px] text-[13px]">
                  <option value="best">Best programs within reach</option>
                  <option value="chance">Highest chance</option>
                </select>
                {TYPES.map(t => <Chip key={t} active={types.includes(t)} onClick={() => toggleType(t, types, setTypes)}>{INSTITUTE_TYPE_LABEL[t]}</Chip>)}
              </div>

              <div className={`${CARD} overflow-hidden`}>
                {shown.length === 0 ? (
                  <p className="p-[24px] text-[13.5px] text-[var(--text-muted)]">{preds.length === 0 ? 'No programs found for these ranks. Check that the ranks and home state are right.' : 'Nothing matches these filters.'}</p>
                ) : (
                  <ul>
                    {shown.slice(0, limit).map(p => <ChanceRow key={p.id} p={p} years={model!.histYears} target={target} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)} />)}
                  </ul>
                )}
              </div>
              {shown.length > limit && (
                <button onClick={() => setLimit(l => l + 60)} className="mx-auto h-[38px] rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-[18px] text-[13px] font-semibold">Show more ({shown.length - limit} left)</button>
              )}
            </>
          )}

          {/* ── choice list ── */}
          {tab === 'list' && submitted && plan && (
            <>
              <div className={`${CARD} flex flex-col gap-[16px] p-[20px]`}>
                <div>
                  <h2 className="font-display text-[16px] font-bold">What you want</h2>
                  <p className="text-[12.5px] text-[var(--text-muted)]">JoSAA gives you the highest choice you clear, so the list follows your wishes. Chances decide what earns a place on it.</p>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <p className="text-[12.5px] font-semibold text-[var(--text-secondary)]">Branches, most wanted first</p>
                  <div className="flex flex-wrap gap-[6px]">
                    {prefs.branches.map((k, i) => (
                      <span key={k} className="inline-flex h-[32px] items-center gap-[2px] rounded-full bg-[var(--accent)] pl-[12px] pr-[4px] text-[12.5px] font-semibold text-white">
                        {i + 1}. {BRANCH_GROUPS.find(g => g.key === k)!.label}
                        <button type="button" onClick={() => moveBranch(k, -1)} disabled={i === 0} aria-label="Move up" className="rounded-full p-[3px] hover:bg-white/20 disabled:opacity-30"><ArrowUp size={12} /></button>
                        <button type="button" onClick={() => moveBranch(k, 1)} disabled={i === prefs.branches.length - 1} aria-label="Move down" className="rounded-full p-[3px] hover:bg-white/20 disabled:opacity-30"><ArrowDown size={12} /></button>
                        <button type="button" onClick={() => toggleBranch(k)} aria-label="Remove" className="rounded-full p-[3px] hover:bg-white/20"><X size={12} /></button>
                      </span>
                    ))}
                    {BRANCH_GROUPS.filter(g => !prefs.branches.includes(g.key)).map(g => (
                      <button key={g.key} type="button" onClick={() => toggleBranch(g.key)} className="h-[32px] rounded-full border border-dashed border-[var(--border-hover)] px-[12px] text-[12.5px] font-semibold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]">+ {g.label}</button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-[14px] md:grid-cols-3">
                  <div className="flex flex-col gap-[6px]">
                    <p className="text-[12.5px] font-semibold text-[var(--text-secondary)]">When they clash, favour</p>
                    <div className="flex flex-wrap gap-[6px]">
                      {([['branch', 'Branch'], ['balanced', 'Both'], ['institute', 'Institute']] as const).map(([k, l]) => <Chip key={k} active={prefs.focus === k} onClick={() => setPrefs(p => ({ ...p, focus: k }))}>{l}</Chip>)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <p className="text-[12.5px] font-semibold text-[var(--text-secondary)]">How far to reach</p>
                    <div className="flex flex-wrap gap-[6px]">
                      {([['careful', 'Careful'], ['balanced', 'Balanced'], ['ambitious', 'Ambitious']] as const).map(([k, l]) => <Chip key={k} active={prefs.ambition === k} onClick={() => setPrefs(p => ({ ...p, ambition: k }))}>{l}</Chip>)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <p className="text-[12.5px] font-semibold text-[var(--text-secondary)]">Institutes</p>
                    <div className="flex flex-wrap gap-[6px]">
                      {TYPES.map(t => <Chip key={t} active={prefs.types.includes(t)} onClick={() => toggleType(t, prefs.types, v => setPrefs(p => ({ ...p, types: v })))}>{INSTITUTE_TYPE_LABEL[t]}</Chip>)}
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-[8px] text-[13px]">
                  <input type="checkbox" checked={prefs.preferHomeState} onChange={e => setPrefs(p => ({ ...p, preferHomeState: e.target.checked }))} className="h-[16px] w-[16px] accent-[var(--accent)]" />
                  I&apos;d rather study in {submitted.homeState}
                </label>
              </div>

              <div className="grid gap-[10px] sm:grid-cols-3">
                <div className={`${CARD} p-[16px]`}>
                  <p className="text-[12.5px] text-[var(--text-muted)]">Chance of a seat from this list</p>
                  <p className="font-display text-[26px] font-bold">{pct(plan.anySeat)}</p>
                </div>
                <div className={`${CARD} p-[16px] sm:col-span-2`}>
                  <p className="text-[12.5px] text-[var(--text-muted)]">Most likely outcome</p>
                  {plan.expectedTop ? (
                    <p className="mt-[2px] text-[14px] font-bold leading-[1.35]">{splitProgram(plan.expectedTop.program).name} · {shortInstitute(plan.expectedTop.institute)} <span className="font-normal text-[var(--text-muted)]">({pct(plan.expectedTop.reachProb)})</span></p>
                  ) : <p className="mt-[2px] text-[14px] text-[var(--text-muted)]">—</p>}
                  <p className="mt-[4px] text-[12px] text-[var(--text-muted)]">{plan.counts.dream} dream · {plan.counts.target} target · {plan.counts.safe} safe</p>
                </div>
              </div>

              <div className={`${CARD} overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-[8px] border-b border-[var(--border)] px-[18px] py-[12px]">
                  <h2 className="font-display text-[16px] font-bold">Your choice list</h2>
                  <div className="flex gap-[6px]">
                    <button onClick={copyList} className="inline-flex h-[34px] items-center gap-[6px] rounded-full border border-[var(--border)] px-[12px] text-[12.5px] font-semibold hover:border-[var(--border-hover)]"><Copy size={13} /> Copy</button>
                    <button onClick={saveToProfile} disabled={saving} className="inline-flex h-[34px] items-center gap-[6px] rounded-full bg-[var(--text-primary)] px-[12px] text-[12.5px] font-semibold text-[var(--bg)] disabled:opacity-60">{saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save</button>
                  </div>
                </div>
                {plan.list.length === 0 ? (
                  <p className="p-[24px] text-[13.5px] text-[var(--text-muted)]">Nothing fits these preferences. Add a branch or an institute type.</p>
                ) : (
                  <ol>
                    {plan.list.map((c: ChoiceItem, i) => {
                      const { name, detail } = splitProgram(c.program)
                      return (
                        <li key={c.id} className="flex items-center gap-[12px] border-b border-[var(--border)] px-[18px] py-[12px] last:border-0">
                          <span className="w-[24px] shrink-0 text-right font-display text-[15px] font-bold text-[var(--text-muted)]">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-bold">{name}</p>
                            <p className="truncate text-[12px] text-[var(--text-muted)]">{shortInstitute(c.institute)}{detail ? ` · ${detail}` : ''} · {c.quota}{c.femaleOnly ? ' · female-only' : ''}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-[9px] py-[2px] text-[11px] font-bold capitalize ${ROLE_STYLE[c.role]}`}>{c.role}</span>
                          <div className="w-[104px] shrink-0 text-right text-[12px]">
                            <p className="font-semibold">{pct(c.chance)} chance</p>
                            <p className="text-[var(--text-muted)]" title="Chance this is the seat you end up with">{pct(c.reachProb)} lands here</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
              <ul className="flex flex-col gap-[6px] text-[12.5px] text-[var(--text-muted)]">
                {plan.list.length > 0 && plan.list.length < 40 && plan.anySeat > 0.995 && <li className="flex gap-[8px]"><Info size={13} className="mt-[2px] shrink-0" /> The list stops once a seat is practically certain — choices below it would never be used.</li>}
                {plan.notes.map((n, i) => <li key={i} className="flex gap-[8px]"><Info size={13} className="mt-[2px] shrink-0" />{n}</li>)}
              </ul>
            </>
          )}

          {/* ── model card ── */}
          {tab === 'model' && (
            <div className={`${CARD} flex flex-col gap-[18px] p-[22px]`}>
              {!model ? <p className="text-[13.5px] text-[var(--text-muted)]">{modelError || 'Loading…'}</p> : (
                <>
                  <div className="flex flex-col gap-[6px]">
                    <h2 className="font-display text-[18px] font-bold">How the predictor works</h2>
                    <p className="max-w-[720px] text-[13.5px] leading-[1.6] text-[var(--text-secondary)]">{model.method}</p>
                    <p className="text-[12.5px] text-[var(--text-muted)]">Data: {model.source}. {model.seats.length.toLocaleString('en-IN')} seat pools across {model.institutes.length} institutes. Closing ranks have risen about {Math.round(model.driftPerYear * 100)}% a year on average.</p>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <h3 className="text-[14px] font-bold">Tested on years it never saw</h3>
                    <p className="text-[12.5px] text-[var(--text-muted)]">Each test trains only on earlier years, forecasts a later counselling, then scores simulated students against what really happened. “Last year&apos;s cutoff” is the rule most students use.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-[13px]">
                        <thead className="text-[12px] text-[var(--text-muted)]">
                          <tr><th className="py-[6px] pr-[12px] font-semibold">Forecast</th><th className="py-[6px] pr-[12px] font-semibold">Chance error (Brier, lower is better)</th><th className="py-[6px] pr-[12px] font-semibold">Admit / not correct</th><th className="py-[6px] font-semibold">80% range held the real cutoff</th></tr>
                        </thead>
                        <tbody>
                          {model.backtest.map(b => (
                            <tr key={`${b.testYear}-${b.horizonYears}`} className="border-t border-[var(--border)]">
                              <td className="py-[8px] pr-[12px]"><strong>{b.testYear}</strong> from data up to {b.testYear - b.horizonYears}</td>
                              <td className="py-[8px] pr-[12px]"><strong>{b.brier.toFixed(3)}</strong> <span className="text-[var(--text-muted)]">vs {b.brierNaive.toFixed(3)} last-year rule ({Math.round((1 - b.brier / b.brierNaive) * 100)}% better)</span></td>
                              <td className="py-[8px] pr-[12px]"><strong>{b.admitAccuracy}%</strong> <span className="text-[var(--text-muted)]">vs {b.admitAccuracyNaive}%</span></td>
                              <td className="py-[8px]"><strong>{b.interval80Coverage}%</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {bt && (
                    <div className="flex flex-col gap-[10px]">
                      <h3 className="text-[14px] font-bold">Does “80%” mean 80%? ({bt.testYear} test)</h3>
                      <div className="flex flex-col gap-[8px]">
                        {bt.calibration.map(c => (
                          <div key={c.band} className="grid grid-cols-[80px_minmax(0,1fr)_120px] items-center gap-[10px] text-[12.5px]">
                            <span className="font-semibold">{c.band}</span>
                            <div className="relative h-[10px] rounded-full bg-[var(--bg-subtle)]">
                              <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]" style={{ width: `${c.actual}%` }} />
                              <div className="absolute inset-y-[-3px] w-[2px] bg-[var(--text-primary)]" style={{ left: `${c.predicted}%` }} title={`Predicted ${c.predicted}%`} />
                            </div>
                            <span className="text-[var(--text-muted)]">said {c.predicted}% · got {c.actual}%</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[12px] text-[var(--text-muted)]">Bar: share of simulated students who really got the seat. Line: the chance the model gave them.</p>
                    </div>
                  )}
                  <p className="text-[12px] leading-[1.6] text-[var(--text-muted)]">Limits: cutoffs swing with seat additions and exam difficulty, so treat chances as guidance, not a guarantee. The {target} forecast is two counsellings ahead of the newest data ({model.dataYears[1]}), which is why ranges are wider than a one-year forecast.</p>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
