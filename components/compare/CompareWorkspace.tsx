'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { useAIGeneration } from '@/hooks/useAIGeneration';

import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine';
import { calculateScholarshipEligibility } from '@/lib/utils/scholarshipEngine';
import { UniversityComparisonService } from '@/lib/ai/gemini/services';
import { formatCurrency, getWinnerIndex } from '@/lib/utils/compareMetrics';

import { CompareHeader } from '@/components/compare/CompareHeader';
import { AIVerdictHero } from '@/components/compare/AIVerdictHero';
import { AILoadingState } from '@/components/ai/AILoadingState';

import {
  CheckCircle2, X as XIcon, RefreshCw, Plus,
  TrendingUp, DollarSign, Users, BookOpen,
  MapPin, Building2, Target, AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';

// ─── helpers ──────────────────────────────────────────────────────────────────

function logoColor(name = '') {
  const palette = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + (h << 5) - h;
  return palette[Math.abs(h) % palette.length];
}

function Badge({ label, color }: { label: string; color: 'green' | 'blue' | 'gold' }) {
  const map = {
    green: { bg: 'rgba(26,174,57,0.12)',  text: 'var(--green)',  border: 'rgba(26,174,57,0.25)' },
    blue:  { bg: 'var(--accent-bg)',       text: 'var(--accent)', border: 'var(--accent-border)' },
    gold:  { bg: 'rgba(217,119,6,0.12)',  text: 'var(--gold)',   border: 'rgba(217,119,6,0.3)'  },
  }[color];
  return (
    <span
      className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: map.bg, color: map.text, border: `1px solid ${map.border}` }}
    >
      {label}
    </span>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-1.5 h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}

function Tags({ items, max = 5 }: { items: string[]; max?: number }) {
  const visible = items.slice(0, max);
  const extra = items.length - max;
  return (
    <div className="flex flex-wrap gap-1 mt-0.5">
      {visible.map((t, i) => (
        <span
          key={i}
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          {t}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>+{extra}</span>
      )}
    </div>
  );
}

// ─── single table row ─────────────────────────────────────────────────────────
function TR({
  label,
  cells,
  winner,
  alt,
  render,
}: {
  label: string;
  cells: any[];
  winner?: number | null;
  alt?: boolean;
  render: (val: any, idx: number, isWinner: boolean) => React.ReactNode;
}) {
  const base = alt ? 'var(--bg-elevated)' : 'var(--bg-card)';
  return (
    <tr>
      {/* label cell */}
      <td
        className="px-5 py-3 text-[12px] font-semibold align-middle"
        style={{
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </td>
      {cells.map((val, idx) => {
        const isWinner = idx === winner;
        return (
          <td
            key={idx}
            className="px-5 py-3 align-middle"
            style={{
              background: isWinner ? 'var(--accent-bg)' : base,
              borderBottom: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
            }}
          >
            {render(val, idx, isWinner)}
          </td>
        );
      })}
    </tr>
  );
}

// ─── section divider row ──────────────────────────────────────────────────────
function Section({ icon, title, colSpan }: { icon: React.ReactNode; title: string; colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-2.5"
        style={{
          background: 'var(--bg)',
          borderTop: '2px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent)' }}>{icon}</span>
          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ─── sections config ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'placements', label: 'Career Outcomes' },
  { id: 'fees',       label: 'Financials' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'campus',     label: 'Campus' },
];

// ─── main workspace ───────────────────────────────────────────────────────────
export function CompareWorkspace({ selectedIds, onClose, onRemove, onAdd }: {
  selectedIds: string[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const { profile, documents, uniqueApps, savedPrograms, universities: allUniversities, scholarships } = useStudentData();
  const { data: aiAnalysis, setData: setAiAnalysis, isGenerating: loadingAI, generate, error } = useAIGeneration<any>();
  const [activeSection, setActiveSection] = useState('overview');
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiTriggered = useRef(false);

  const selectedUniversities = useMemo(
    () => selectedIds.map(id => allUniversities.find((u: any) => u.id === id)).filter(Boolean),
    [allUniversities, selectedIds]
  );

  const comparisonData = useMemo(() => {
    if (!profile || selectedUniversities.length === 0) return null;
    const eng = calculateProfileStrength(profile, documents || []);
    return {
      profileStrength: eng.percentage,
      universities: selectedUniversities.map(uni => {
        const rec = recommendUniversities([uni], {
          profile, documents: documents || [], applications: uniqueApps || [],
          savedPrograms: savedPrograms || [], profileScore: eng.percentage,
        })[0];
        const prob = calculateAdmissionProbability({
          profile, documents: documents || [], applications: uniqueApps || [],
          savedPrograms: savedPrograms || [], profileScore: eng.percentage,
        }, uni as any);
        const sch = calculateScholarshipEligibility(
          { profile, documents: documents || [], profileScore: eng.percentage }, scholarships
        ).filter((s: any) => s.scholarship.universityId === uni?.id || !s.scholarship.universityId);
        return {
          university: uni,
          recommendation: rec || { overallMatchScore: 0, strengths: [], weaknesses: [], matchReasons: [], missingRequirements: [] },
          probability: prob || { overallProbability: 0, probabilityLabel: 'Low' },
          bestScholarship: sch[0] || null,
        };
      }),
    };
  }, [profile, documents, uniqueApps, savedPrograms, selectedUniversities, scholarships]);

  useEffect(() => { aiTriggered.current = false; setAiAnalysis(null); }, [selectedIds.join(',')]);
  useEffect(() => {
    if (comparisonData && comparisonData.universities.length >= 2 && !aiAnalysis && !loadingAI && !error && !aiTriggered.current) {
      aiTriggered.current = true;
      generate(() => UniversityComparisonService.compare(selectedUniversities, comparisonData));
    }
  }, [comparisonData]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  useEffect(() => {
    const handle = () => {
      let cur = activeSection;
      for (const s of SECTIONS) {
        const el = document.getElementById(`sec-${s.id}`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 200 && r.bottom >= 200) { cur = s.id; break; }
      }
      if (cur !== activeSection) setActiveSection(cur);
    };
    const c = scrollRef.current;
    c?.addEventListener('scroll', handle);
    return () => c?.removeEventListener('scroll', handle);
  }, [activeSection]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`sec-${id}`);
    if (el && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
  };

  if (!comparisonData || allUniversities.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <AILoadingState title="Loading…" description="Preparing comparison." />
      </div>
    );
  }

  const D = comparisonData.universities; // shorthand
  const cols = D.length + 1; // label col + university cols

  // metric arrays
  const matchScores   = D.map(d => d.recommendation?.overallMatchScore || 0);
  const bestMatch     = getWinnerIndex(matchScores, 'higher_is_better');
  const highestPkgs   = D.map(d => (d.university as any)?.placementDetails?.highestPackageLpa || (d.university as any)?.highestPackageLpa || 0);
  const avgPkgs       = D.map(d => (d.university as any)?.placementDetails?.avgPackageLpa    || (d.university as any)?.avgPackageLpa    || 0);
  const rates         = D.map(d => (d.university as any)?.placementDetails?.placementRate    || (d.university as any)?.placementRate    || 0);
  const bestHighPkg   = getWinnerIndex(highestPkgs, 'higher_is_better');
  const bestAvgPkg    = getWinnerIndex(avgPkgs,     'higher_is_better');
  const bestRate      = getWinnerIndex(rates,        'higher_is_better');
  const fees          = D.map(d => (d.university as any)?.feesPerYear || 0);
  const bestFee       = getWinnerIndex(fees, 'lower_is_better');
  const probs         = D.map(d => d.probability?.overallProbability || 0);
  const bestProb      = getWinnerIndex(probs, 'higher_is_better');
  const ranks         = D.map(d => (d.university as any)?.rankings?.qsOverall || 0);
  const bestRank      = getWinnerIndex(ranks.map(r => r || 99999), 'lower_is_better');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* ── Top action bar ── */}
        <CompareHeader onClose={onClose} />

        {/* ── Section nav ── */}
        <div
          className="shrink-0 flex items-center px-5 gap-1 overflow-x-auto hide-scrollbar"
          style={{ height: '40px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        >
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="text-[12px] font-semibold whitespace-nowrap px-3 h-7 rounded-md transition-colors"
              style={{
                color: activeSection === s.id ? 'var(--accent)' : 'var(--text-muted)',
                background: activeSection === s.id ? 'var(--accent-bg)' : 'transparent',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-auto">
          <div className="min-w-[600px]">

            {/* AI Verdict */}
            {selectedIds.length >= 2 && (
              <div className="px-5 py-4">
                <AIVerdictHero aiAnalysis={aiAnalysis} loading={loadingAI} error={error} />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                ONE TABLE — thead is sticky university cards,
                tbody is all comparison rows.
                This guarantees column alignment.
            ═══════════════════════════════════════════════════════ */}
            <div className="px-5 pb-10">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
              >
                <table
                  className="w-full border-collapse"
                  style={{ tableLayout: 'fixed' }}
                >
                  <colgroup>
                    <col style={{ width: '180px' }} />
                    {D.map((_, i) => <col key={i} />)}
                    {D.length < 3 && <col style={{ width: '160px' }} />}
                  </colgroup>

                  {/* ── THEAD — university header cards (sticky) ── */}
                  <thead
                    className="sticky top-0 z-30"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <tr>
                      {/* Corner label */}
                      <th
                        className="px-5 py-4 text-left align-bottom"
                        style={{
                          background: 'var(--bg-elevated)',
                          borderBottom: '2px solid var(--border)',
                          borderRight: '1px solid var(--border)',
                        }}
                      >
                        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          Feature
                        </span>
                      </th>

                      {/* Per-university header */}
                      {D.map((item, idx) => {
                        const u = item.university as any;
                        const color = logoColor(u?.name);
                        const score = item.recommendation?.overallMatchScore || 0;
                        const isFirst = idx === 0;
                        return (
                          <th
                            key={u?.id}
                            className="px-5 py-4 text-left align-top"
                            style={{
                              background: isFirst ? 'var(--accent-bg)' : 'var(--bg-card)',
                              borderBottom: `2px solid ${isFirst ? 'var(--accent)' : 'var(--border)'}`,
                              borderRight: '1px solid var(--border)',
                              fontWeight: 'normal',
                            }}
                          >
                            {/* Logo + name */}
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[15px] font-black shrink-0 mt-0.5"
                                style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                              >
                                {(u?.shortName || u?.name || 'U').charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-1">
                                  <p className="text-[13px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                    {u?.name}
                                  </p>
                                  {/* remove/swap */}
                                  <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                    <button
                                      onClick={() => { onRemove(u?.id); onAdd?.(); }}
                                      title="Replace"
                                      className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                                      style={{ color: 'var(--text-muted)' }}
                                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    >
                                      <RefreshCw size={11} />
                                    </button>
                                    <button
                                      onClick={() => onRemove(u?.id)}
                                      title="Remove"
                                      className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                                      style={{ color: 'var(--text-muted)' }}
                                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    >
                                      <XIcon size={12} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                  {u?.type}
                                </p>
                                {/* Match bar */}
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${score}%`,
                                        background: score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--gold)' : 'var(--accent)',
                                      }}
                                    />
                                  </div>
                                  <span className="text-[11px] font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
                                    {score}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </th>
                        );
                      })}

                      {/* Add university column */}
                      {D.length < 3 && (
                        <th
                          className="px-4 py-4 align-middle"
                          style={{
                            background: 'var(--bg-card)',
                            borderBottom: '2px solid var(--border)',
                            fontWeight: 'normal',
                          }}
                        >
                          <button
                            onClick={onAdd}
                            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 h-9 rounded-lg w-full justify-center transition-colors"
                            style={{
                              background: 'var(--bg-elevated)',
                              border: '1.5px dashed var(--border-hover)',
                              color: 'var(--accent)',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-bg)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
                          >
                            <Plus size={14} /> Add
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>

                  {/* ── TBODY — all comparison rows ── */}
                  <tbody>

                    {/* ══ OVERVIEW ══ */}
                    <tr id="sec-overview"><td colSpan={cols} style={{ padding: 0 }} /></tr>
                    <Section icon={<BookOpen size={13} />} title="Academic Overview" colSpan={cols} />

                    {/* Profile Match */}
                    <TR
                      label="Profile Match"
                      cells={matchScores}
                      winner={bestMatch}
                      render={(score, idx, isWinner) => (
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-10 h-10 shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15" strokeWidth="3" fill="none" stroke="var(--border)" />
                              <circle cx="18" cy="18" r="15" strokeWidth="3" fill="none" strokeLinecap="round"
                                strokeDasharray="94.25"
                                strokeDashoffset={94.25 - (94.25 * score) / 100}
                                stroke={score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--gold)' : 'var(--accent)'}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black" style={{ color: 'var(--text-primary)' }}>
                              {score}
                            </div>
                          </div>
                          {isWinner && score > 0 && <Badge label="Best" color="green" />}
                        </div>
                      )}
                    />

                    <TR
                      label="Location"
                      cells={D.map(d => d.university)}
                      alt
                      render={(u: any) => {
                        const loc = typeof u?.location === 'object' && u?.location
                          ? `${(u.location as any).city || ''}, ${(u.location as any).state || ''}`.replace(/^, |, $/g, '')
                          : String(u?.location || '');
                        return loc
                          ? <div className="flex items-center gap-1.5"><MapPin size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /><span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{loc}</span></div>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>;
                      }}
                    />

                    <TR
                      label="Type"
                      cells={D.map(d => (d.university as any)?.type)}
                      render={(type: string) => (
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{type || '—'}</span>
                        </div>
                      )}
                    />

                    {ranks.some(r => r > 0) && (
                      <TR
                        label="QS Rank"
                        cells={ranks}
                        winner={bestRank}
                        alt
                        render={(rank: number, idx, isWinner) => (
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold" style={{ color: rank ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {rank ? `#${rank}` : '—'}
                            </span>
                            {isWinner && rank > 0 && <Badge label="Top Ranked" color="blue" />}
                          </div>
                        )}
                      />
                    )}

                    {D.some(d => d.recommendation?.strengths?.length > 0) && (
                      <TR
                        label="Strengths"
                        cells={D.map(d => d.recommendation?.strengths || [])}
                        render={(s: string[]) => s.length > 0 ? <Tags items={s} max={4} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      />
                    )}

                    {/* ══ CAREER ══ */}
                    <tr id="sec-placements"><td colSpan={cols} style={{ padding: 0 }} /></tr>
                    <Section icon={<TrendingUp size={13} />} title="Career Outcomes" colSpan={cols} />

                    <TR label="Highest Package" cells={highestPkgs} winner={bestHighPkg}
                      render={(v, _, iw) => v > 0
                        ? <div className="flex items-center gap-2 flex-wrap"><span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>₹{v} <span className="text-[12px] font-normal" style={{ color: 'var(--text-muted)' }}>LPA</span></span>{iw && <Badge label="Highest" color="green" />}</div>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    />
                    <TR label="Average Package" cells={avgPkgs} winner={bestAvgPkg} alt
                      render={(v, _, iw) => v > 0
                        ? <div className="flex items-center gap-2 flex-wrap"><span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>₹{v} <span className="text-[12px] font-normal" style={{ color: 'var(--text-muted)' }}>LPA</span></span>{iw && <Badge label="Best Avg" color="green" />}</div>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    />
                    <TR label="Placement Rate" cells={rates} winner={bestRate}
                      render={(r, _, iw) => r > 0
                        ? <div><div className="flex items-center gap-2"><span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{r}%</span>{iw && <Badge label="Top Rate" color="green" />}</div><Bar pct={r} color={r >= 80 ? 'var(--green)' : r >= 60 ? 'var(--gold)' : 'var(--red)'} /></div>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    />
                    {D.some(d => (d.university as any)?.placementDetails?.topRecruiters?.length > 0) && (
                      <TR label="Top Recruiters" cells={D.map(d => (d.university as any)?.placementDetails?.topRecruiters || [])} alt
                        render={(recs: string[]) => recs.length > 0 ? <Tags items={recs} max={5} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      />
                    )}

                    {/* ══ FINANCIALS ══ */}
                    <tr id="sec-fees"><td colSpan={cols} style={{ padding: 0 }} /></tr>
                    <Section icon={<DollarSign size={13} />} title="Financial Comparison" colSpan={cols} />

                    <TR label="Annual Tuition" cells={fees} winner={bestFee}
                      render={(f, _, iw) => f > 0
                        ? <div className="flex items-center gap-2 flex-wrap"><span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(f)}</span>{iw && <Badge label="Most Affordable" color="gold" />}</div>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    />
                    <TR label="Top Scholarship" cells={D.map(d => d.bestScholarship)} alt
                      render={(sch) => sch
                        ? <div className="rounded-lg p-2.5" style={{ background: 'rgba(26,174,57,0.07)', border: '1px solid rgba(26,174,57,0.18)' }}>
                            <p className="text-[12px] font-bold" style={{ color: 'var(--green)' }}>{sch.scholarship.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sch.eligibilityScore}% match</p>
                            {sch.scholarship.amount && <p className="text-[14px] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{typeof sch.scholarship.amount === 'number' ? formatCurrency(sch.scholarship.amount) : sch.scholarship.amount}</p>}
                          </div>
                        : <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No matched scholarships</span>}
                    />
                    {D.some(d => (d.university as any)?.scholarships?.length > 0) && (
                      <TR label="Scholarships" cells={D.map(d => (d.university as any)?.scholarships || [])}
                        render={(list: string[]) => list.length > 0
                          ? <div className="flex flex-col gap-1">{list.slice(0, 3).map((s: string, i: number) => <div key={i} className="flex items-start gap-1.5"><CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} /><span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{s}</span></div>)}{list.length > 3 && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>+{list.length-3} more</span>}</div>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      />
                    )}

                    {/* ══ ADMISSIONS ══ */}
                    <tr id="sec-admissions"><td colSpan={cols} style={{ padding: 0 }} /></tr>
                    <Section icon={<Target size={13} />} title="Admission Insights" colSpan={cols} />

                    <TR label="Admission Probability" cells={probs} winner={bestProb}
                      render={(p, _, iw) => (
                        <div>
                          <div className="flex items-center gap-2"><span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{p}%</span>{iw && <Badge label="Safest" color="green" />}</div>
                          <Bar pct={p} color={p >= 70 ? 'var(--green)' : p >= 40 ? 'var(--gold)' : 'var(--red)'} />
                        </div>
                      )}
                    />
                    <TR label="Risk Level" cells={D.map(d => d.probability?.probabilityLabel || 'Unknown')} alt
                      render={(lbl: string) => {
                        const low = lbl === 'Very Low' || lbl === 'Low';
                        const mid = lbl === 'Moderate';
                        return <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full" style={{ background: low ? 'rgba(220,38,38,0.1)' : mid ? 'rgba(217,119,6,0.1)' : 'rgba(26,174,57,0.1)', color: low ? 'var(--red)' : mid ? 'var(--gold)' : 'var(--green)' }}>{lbl}</span>;
                      }}
                    />
                    <TR label="Gaps to Address" cells={D.map(d => d.recommendation?.missingRequirements || [])}
                      render={(reqs: string[]) => reqs.length > 0
                        ? <div className="rounded-lg p-2.5" style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.18)' }}>{reqs.map((r: string, i: number) => <div key={i} className="flex items-start gap-1.5 mb-1"><AlertTriangle size={11} className="mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} /><span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{r}</span></div>)}</div>
                        : <div className="flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: 'var(--green)' }} /><span className="text-[12px] font-medium" style={{ color: 'var(--green)' }}>No major gaps</span></div>}
                    />

                    {/* ══ CAMPUS ══ */}
                    <tr id="sec-campus"><td colSpan={cols} style={{ padding: 0 }} /></tr>
                    <Section icon={<Users size={13} />} title="Campus Experience" colSpan={cols} />

                    {/* Campus images */}
                    {D.some(d => (d.university as any)?.heroImageUrl) && (
                      <tr>
                        <td className="px-5 py-3 text-[12px] font-semibold align-middle" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Campus Photo</td>
                        {D.map((item, idx) => (
                          <td key={idx} className="p-3" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                            {(item.university as any)?.heroImageUrl
                              ? <div className="relative w-full h-[110px] rounded-xl overflow-hidden"><Image src={(item.university as any)?.heroImageUrl} alt={(item.university as any)?.name || ''} fill className="object-cover" unoptimized /></div>
                              : <div className="w-full h-[110px] rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}><span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No image</span></div>}
                          </td>
                        ))}
                        {D.length < 3 && <td style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }} />}
                      </tr>
                    )}

                    {D.some(d => (d.university as any)?.campusSize) && (
                      <TR label="Campus Size" cells={D.map(d => (d.university as any)?.campusSize)} alt
                        render={(s: string) => s ? <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{s}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      />
                    )}
                    {D.some(d => (d.university as any)?.facilities?.length > 0) && (
                      <TR label="Facilities" cells={D.map(d => (d.university as any)?.facilities || [])}
                        render={(facs: string[]) => facs.length > 0 ? <Tags items={facs} max={6} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      />
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
