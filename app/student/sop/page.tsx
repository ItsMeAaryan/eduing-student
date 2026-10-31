'use client';

import React, { useState, useCallback, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useToast } from '@/hooks/useToast';
import { SOPService } from '@/lib/ai/gemini/services';
import { auth, db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Wand2, BookOpen, CheckCircle2, AlertCircle, Copy, Download,
  Save, MessageSquareText, ArrowLeft, ChevronLeft, ChevronRight,
  Plus, X, Hash, Zap, RotateCcw, GraduationCap,
  Sparkles, FileText, User, Target,
} from 'lucide-react';

/* ══ Constants ═══════════════════════════════════════════════════════════ */
const TONES = [
  { id: 'Formal Tone',      icon: FileText,      color: 'var(--accent)', desc: 'Structured academic prose'    },
  { id: 'Academic Focus',   icon: BookOpen,      color: 'var(--accent)', desc: 'Research & theory emphasis'   },
  { id: 'Research Focus',   icon: Target,        color: 'var(--accent)', desc: 'Analytical depth & rigor'     },
  { id: 'Leadership Focus', icon: GraduationCap, color: 'var(--accent)', desc: 'Impact-driven narrative'       },
];

const WORD_LIMITS = ['500 words', '800 words', '1000 words', '1200 words'];

const TONE_TIPS: Record<string, string[]> = {
  'Formal Tone': [
    'Avoid contractions — write "do not" instead of "don\'t".',
    'Open with a concrete achievement, not a philosophical statement.',
    'State your goal in the first paragraph clearly and directly.',
  ],
  'Academic Focus': [
    'Reference specific coursework or professors where relevant.',
    'Quantify academic achievements: rank, GPA, or publication count.',
    'Connect theory to your research ambitions explicitly.',
  ],
  'Research Focus': [
    'Identify a specific research gap you plan to address.',
    'Name faculty whose work aligns with your interests.',
    'Describe your methodology thinking, not just topics.',
  ],
  'Leadership Focus': [
    'Open with a story of measurable impact — a team you led.',
    'Quantify outcomes: "reduced time by 40%", "led 12-person team".',
    'Connect leadership experience to your post-degree vision.',
  ],
};

/* ══ Sub-components ══════════════════════════════════════════════════════ */
function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--gold)' : 'var(--red)';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{score}<span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>/10</span></span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 4 }}
        />
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  const ok = !!value;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
      <Icon size={12} style={{ color: ok ? 'var(--green)' : 'var(--text-faint)', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
      {ok
        ? <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{value!.length > 18 ? value!.slice(0, 16) + '…' : value}</span>
        : <a href="/student/profile" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ color: 'var(--text-faint)' }}>—</span> <span style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--accent-bg)' }}>+ Add</span>
          </a>
      }
    </div>
  );
}

/* ══ Main Component ══════════════════════════════════════════════════════ */
function SOPBuilderContent() {
  const { profile } = useStudentData();
  const { toast } = useToast();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Phase state
  const [phase, setPhase] = useState<'setup' | 'editor'>('setup');

  // Setup inputs
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [wordLimit, setWordLimit] = useState('800 words');
  const [tone, setTone] = useState('Formal Tone');
  const [background, setBackground] = useState('');
  const [achievements, setAchievements] = useState<string[]>(['']);

  // Editor state
  const [sopTitle, setSopTitle] = useState('Statement of Purpose');
  const [sopText, setSopText] = useState('');
  const [panelOpen, setPanelOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'review' | 'tips'>('review');

  // Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: reviewData, isGenerating: isReviewing, generate: runReview } = useAIGeneration<any>();

  // Derived — `p` is memoized to prevent unstable dependencies in child hooks
  const p = useMemo(() => (profile as any) || {}, [profile]);
  const wordCount = useMemo(() => sopText.trim() ? sopText.trim().split(/\s+/).length : 0, [sopText]);
  const wordTarget = parseInt(wordLimit) || 800;
  const canGenerate = university.trim() && course.trim() && !isGenerating;

  const profileFields = useMemo(() => [
    { label: 'Full Name',     value: p.fullName || null,       icon: User          },
    { label: 'Stream',        value: p.stream || null,         icon: BookOpen      },
    { label: '12th Score',    value: p.twelfthScore ? `${p.twelfthScore}%` : null, icon: FileText },
    { label: 'JEE Score',     value: p.jeeScore ? String(p.jeeScore) : null,       icon: Target   },
    { label: 'CUET Score',    value: p.cuetScore ? String(p.cuetScore) : null,     icon: Target   },
    { label: 'Target Degree', value: p.targetDegree || null,  icon: GraduationCap },
  ], [p]);

  const readyCount = profileFields.filter(f => f.value).length;
  const readyPct = Math.round((readyCount / profileFields.length) * 100);

  /* ── Achievements helpers ───────────────────────────────────────────── */
  const addAchievement = () => { if (achievements.length < 5) setAchievements(a => [...a, '']); };
  const removeAchievement = (i: number) => setAchievements(a => a.filter((_, idx) => idx !== i));
  const updateAchievement = (i: number, v: string) => setAchievements(a => a.map((x, idx) => idx === i ? v : x));

  /* ── Generate SOP ───────────────────────────────────────────────────── */
  const handleGenerate = useCallback(async () => {
    if (!profile) { toast.error('Profile not loaded yet. Please wait.'); return; }
    if (!university.trim()) { toast.error('Please enter a Target University.'); return; }
    if (!course.trim()) { toast.error('Please enter a Target Course.'); return; }

    setIsGenerating(true);
    try {
      const context = {
        studentProfile: profile,
        studentName:    p.fullName      || '',
        academicStream: p.stream        || '',
        targetDegree:   p.targetDegree  || '',
        bachelorDegree: p.bachelorDegree || '',
        bachelorCgpa:   p.bachelorCgpa  || '',
        twelfthScore:   p.twelfthScore  || '',
        jeeScore:       p.jeeScore      || '',
        cuetScore:      p.cuetScore     || '',
        city:           p.city          || '',
        state:          p.state         || '',
        targetUniversity: university,
        targetCourse: course,
        specialization,
        wordLimit,
        personalBackground: background,
        keyAchievements: achievements.filter(a => a.trim()),
      };

      const result = await SOPService.generateSOP(context, tone);
      if (!result.success) { toast.error('SOP generation failed. Please try again.'); return; }

      const data = result.data as { title?: string; sections?: { heading: string; content: string }[] } | null;
      let text = '';
      let title = 'Statement of Purpose';

      if (data?.sections?.length) {
        title = data.title || title;
        text = data.sections.map(s => `${s.heading}\n\n${s.content}`).join('\n\n');
      } else {
        // Fallback: parse raw text
        try {
          const raw = JSON.parse((result.text || '').replace(/```json|```/g, '').trim());
          if (raw?.sections?.length) {
            title = raw.title || title;
            text = raw.sections.map((s: any) => `${s.heading}\n\n${s.content}`).join('\n\n');
          }
        } catch { /* ignore */ }
      }

      if (!text) { toast.error('AI returned an empty response. Please try again.'); return; }

      setSopTitle(title);
      setSopText(text);
      setPhase('editor');
      // Scroll to top
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [profile, university, course, specialization, wordLimit, tone, background, achievements, toast, p]);

  /* ── AI Review ──────────────────────────────────────────────────────── */
  const handleReview = async () => {
    if (!sopText.trim()) { toast.error('Generate an SOP first.'); return; }
    setRightTab('review');
    await runReview(() => SOPService.reviewSOP(sopText, { studentProfile: profile }));
  };

  /* ── Copy ───────────────────────────────────────────────────────────── */
  const handleCopy = () => {
    navigator.clipboard.writeText(`${sopTitle}\n\n${sopText}`)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Copy failed. Please try again.'));
  };

  /* ── Export ─────────────────────────────────────────────────────────── */
  const handleExport = () => {
    const filename = `SOP_${university.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([`${sopTitle}\n\n${sopText}`], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported as ${filename}`);
  };

  /* ── Save Draft to Firestore ────────────────────────────────────────── */
  const handleSaveDraft = async () => {
    const user = auth.currentUser;
    if (!user) { toast.error('Please log in to save drafts.'); return; }
    if (!sopText) { toast.error('Nothing to save.'); return; }
    try {
      await addDoc(collection(db, 'sop_drafts'), {
        uid: user.uid,
        title: sopTitle,
        text: sopText,
        university,
        course,
        tone,
        wordLimit,
        createdAt: serverTimestamp(),
      });
      toast.success('Draft saved to your account!');
    } catch {
      toast.error('Failed to save draft. Please try again.');
    }
  };

  /* ─────────────────────────────────────────────────────────────────────
     RENDER PHASE 1 — SETUP
  ───────────────────────────────────────────────────────────────────── */
  if (phase === 'setup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-subtle)', paddingBottom: 80, fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* Step Indicator Header */}
        <div style={{ width: '100%', maxWidth: 860, margin: '24px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Step 1 of 2</span>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>— Setup</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 140, height: 6, borderRadius: 3, background: 'var(--border-hover)', overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 500 }}>Step 2 — Editor</span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 860, display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Main form continuous card ── */}
          <div style={{ flex: 1, minWidth: 0, background: 'var(--bg-card)', borderRadius: 22, border: '1px solid var(--border-hover)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Hero header */}
            <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 42, height: 42, background: 'var(--accent-bg)', borderLeft: '3px solid var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Build Your SOP</h1>
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.6, maxWidth: 560 }}>
                Answer a few questions and EDUING AI will write a compelling Statement of Purpose tailored to your profile.
              </p>
            </div>

            {/* Section 1 — Target */}
            <div>
              <SectionHeader number="1" title="Target" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <LabeledInput label="Target University" required value={university} onChange={setUniversity} placeholder="e.g. IIT Bombay, Delhi University" />
                <LabeledInput label="Target Course" required value={course} onChange={setCourse} placeholder="e.g. M.Tech Computer Science" />
                <LabeledInput label="Specialization" value={specialization} onChange={setSpecialization} placeholder="e.g. Machine Learning, VLSI" optional />
                <div>
                  <label htmlFor="wordLimit" style={labelStyle}>Word Limit</label>
                  <select id="wordLimit" value={wordLimit} onChange={e => setWordLimit(e.target.value)} style={inputStyle}>
                    {WORD_LIMITS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 — Writing Style */}
            <div>
              <SectionHeader number="2" title="Writing Style" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
                {TONES.map(t => {
                  const active = tone === t.id;
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setTone(t.id)}
                      className="tone-card-btn"
                      style={{
                        minWidth: 140, padding: 20, borderRadius: 18, cursor: 'pointer',
                        border: active ? '2px solid var(--accent)' : '1.5px solid var(--border-hover)',
                        background: active ? 'var(--accent-bg)' : 'var(--bg-card)',
                        boxShadow: active ? '0 2px 8px rgba(124,58,237,0.15)' : 'none',
                        transition: 'all 0.2s ease', textAlign: 'left',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
                      }}>
                      <div style={{ width: 32, height: 32, borderRadius: 12, background: active ? 'var(--accent-bg)' : 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>{t.id}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3 — Your Story */}
            <div>
              <SectionHeader number="3" title="Your Story" />
              <div style={{ marginTop: 16 }}>
                <label htmlFor="background" style={labelStyle}>Personal Background & Motivation</label>
                <textarea id="background" value={background} onChange={e => setBackground(e.target.value)}
                  placeholder="Describe your background, motivations, and what drives your interest in this program…"
                  style={{ ...inputStyle, minHeight: 140, resize: 'vertical', padding: '12px 14px', lineHeight: 1.65 }} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{background.length} characters</p>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={labelStyle}>Key Achievements</div>
                  {achievements.length < 5 && (
                    <button onClick={addAchievement}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 12px', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--accent-border)', background: 'var(--accent-bg)', fontSize: 12, fontWeight: 600, color: 'var(--accent)', transition: 'all 0.2s ease' }}>
                      <Plus size={12} /> Add Achievement
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {achievements.map((ach, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{i + 1}</span>
                      <input value={ach} onChange={e => updateAchievement(i, e.target.value)}
                        placeholder={`Achievement ${i + 1} — e.g. "Won national hackathon 2024"`}
                        style={{ ...inputStyle, flex: 1, height: 42 }} />
                      {achievements.length > 1 && (
                        <button onClick={() => removeAchievement(i)}
                          style={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' }}>
                          <X size={14} style={{ color: 'var(--red)' }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{achievements.filter(a => a.trim()).length} of 5 added</p>
              </div>
            </div>

            {/* Draft Button */}
            <div>
              <button onClick={handleGenerate} disabled={!canGenerate}
                className="draft-btn"
                style={{
                  width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  borderRadius: 18, cursor: canGenerate ? 'pointer' : 'not-allowed', border: 'none',
                  background: canGenerate ? 'linear-gradient(135deg, var(--accent), #6D28D9)' : 'var(--border-hover)',
                  color: '#FFFFFF', fontSize: 16, fontWeight: 600,
                  boxShadow: canGenerate ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                {isGenerating
                  ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Writing your SOP…</>
                  : <><Sparkles size={18} /> Draft My SOP →</>
                }
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Takes ~15 seconds · Fully editable after generation
              </p>
            </div>
          </div>

          {/* ── Right Profile Panel ── */}
          <div style={{ width: 240, flexShrink: 0, position: 'sticky', top: 24 }}>
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid #F0F0F0', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Your Profile Data</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>Auto-included in SOP:</p>
              </div>

              <div>
                {profileFields.map(f => <ProfileRow key={f.label} icon={f.icon} label={f.label} value={f.value} />)}
              </div>

              {/* Progress Indicator */}
              <div style={{ borderTop: '1px solid var(--border-hover)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{readyCount}/{profileFields.length} ready</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{readyPct}% complete</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--border-hover)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: `${readyPct}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>

              <a href="/student/profile" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                Complete your profile for a better SOP →
              </a>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .tone-card-btn:hover { background: var(--bg-card-hover) !important; border-color: var(--border-hover) !important; }
          .draft-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
        `}</style>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────
     RENDER PHASE 2 — EDITOR
  ───────────────────────────────────────────────────────────────────── */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="editor"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', gap: 0, height: 'calc(100vh - 120px)', minHeight: 580, fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setPhase('setup')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s ease' }}>
              <ArrowLeft size={13} /> Edit Setup
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{university}</span>
              <span>·</span>
              <span>{course}</span>
              {specialization && <><span>·</span><span style={{ fontStyle: 'italic' }}>{specialization}</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
              <Hash size={10} />
              <span>{wordCount} / {wordTarget} words</span>
            </div>
          </div>
        </div>

        {/* ── Main split ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 14, flex: 1, overflow: 'hidden' }}>

          {/* Editor area */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
            {/* Title */}
            <div style={{ padding: '24px 40px 0', flexShrink: 0 }}>
              <input type="text" value={sopTitle} onChange={e => setSopTitle(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', outline: 'none', paddingBottom: 10, marginBottom: 4, letterSpacing: '-0.01em', boxSizing: 'border-box' }} />
            </div>

            {/* Body textarea */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 40px 100px' }}>
              <textarea
                ref={editorRef}
                value={sopText}
                onChange={e => setSopText(e.target.value)}
                style={{
                  width: '100%', minHeight: '100%', background: 'transparent', border: 'none', outline: 'none',
                  resize: 'none', fontSize: 15.5, lineHeight: 1.9, color: 'var(--text-primary)',
                  fontFamily: '"Georgia", "Times New Roman", serif', letterSpacing: '0.01em', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Floating action bar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '12px 20px', borderTop: '1px solid var(--border)',
              background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
            }}>
              {[
                { label: '✦ Expand', action: () => toast.success('Select a paragraph to expand.') },
                { label: '✦ Improve Tone', action: () => toast.success('Select text to improve tone.') },
                { label: '✦ Simplify', action: () => toast.success('Select text to simplify.') },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  style={{ height: 28, padding: '0 11px', borderRadius: 99, border: '1px solid var(--accent-border)', background: 'var(--accent-bg)', fontSize: 11, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  {btn.label}
                </button>
              ))}
              <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
              <button onClick={handleCopy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 11px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <Copy size={11} /> Copy
              </button>
              <button onClick={handleExport}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 11px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <Download size={11} /> Export .txt
              </button>
              <button onClick={handleSaveDraft}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 11px', borderRadius: 12, border: 'none', background: 'var(--accent)', fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <Save size={11} /> Save Draft
              </button>
            </div>
          </div>

          {/* AI Panel */}
          {panelOpen && (
            <div style={{ width: 272, flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 22, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {/* Tabs + collapse */}
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                {(['review', 'tips'] as const).map(tab => (
                  <button key={tab} onClick={() => setRightTab(tab)}
                    style={{ flex: 1, padding: '11px 0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', border: 'none', background: 'transparent', color: rightTab === tab ? 'var(--accent)' : 'var(--text-muted)', borderBottom: rightTab === tab ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                    {tab === 'review' ? 'Review' : 'Tips'}
                  </button>
                ))}
                <button onClick={() => setPanelOpen(false)}
                  style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                {/* REVIEW tab */}
                {rightTab === 'review' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Run button */}
                    <button onClick={handleReview} disabled={isReviewing}
                      style={{ width: '100%', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 9, cursor: 'pointer', border: '1px solid var(--accent-border)', background: 'var(--accent-bg)', fontSize: 13, fontWeight: 700, color: 'var(--accent)', transition: 'all 0.2s ease' }}>
                      {isReviewing
                        ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(124,58,237,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Analyzing…</>
                        : <><MessageSquareText size={13} /> Run AI Review</>
                      }
                    </button>

                    {!reviewData && !isReviewing && (
                      <div style={{ textAlign: 'center', padding: '28px 0' }}>
                        <MessageSquareText size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>Click &quot;Run AI Review&quot; to get dimension scores and improvement suggestions.</p>
                      </div>
                    )}

                    {reviewData && !isReviewing && (
                      <AnimatePresence>
                        <motion.div key="review-results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          {/* Overall */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 14, marginBottom: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--accent)' }}>{reviewData.overallScore ?? '—'}</span>
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Overall Score</p>
                              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>Out of 100</p>
                            </div>
                          </div>

                          {/* Dimension bars */}
                          {[
                            { key: 'openingImpact',     label: 'Opening Impact'     },
                            { key: 'clarityOfGoals',    label: 'Clarity of Goals'   },
                            { key: 'academicRelevance', label: 'Academic Relevance' },
                            { key: 'originality',       label: 'Originality'        },
                            { key: 'conclusionStrength',label: 'Conclusion'         },
                          ].map(({ key, label }) => reviewData[key] != null
                            ? <ScoreBar key={key} label={label} score={Number(reviewData[key])} />
                            : null
                          )}

                          {/* Improvements */}
                          {(reviewData.actionableImprovements || []).length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', margin: '0 0 8px' }}>Suggestions</p>
                              {(reviewData.actionableImprovements as string[]).slice(0, 3).map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 6 }}>
                                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{i + 1}</span>
                                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>{s}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <button onClick={handleReview} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', height: 30, marginTop: 4, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                            <RotateCcw size={11} /> Re-run
                          </button>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                )}

                {/* TIPS tab */}
                {rightTab === 'tips' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Zap size={11} style={{ color: 'var(--gold)' }} />
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', margin: 0 }}>Tips — {tone}</p>
                    </div>
                    {(TONE_TIPS[tone] || []).map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: 'var(--gold-bg)', border: '1px solid color-mix(in srgb, var(--gold-bright) 40%, transparent)', borderRadius: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel re-open button when collapsed */}
          {!panelOpen && (
            <button onClick={() => setPanelOpen(true)}
              style={{ width: 32, flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s ease' }}>
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </AnimatePresence>
  );
}

/* ══ Small form helpers ══════════════════════════════════════════════════ */
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px', boxSizing: 'border-box',
  background: 'var(--bg-card)', border: '1.5px solid var(--border-hover)',
  borderRadius: 14, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
  transition: 'all 0.2s ease',
};

function LabeledInput({ label, value, onChange, placeholder, required, optional }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; optional?: boolean;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={inputId} style={labelStyle}>
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>} {optional && <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-faint)', textTransform: 'none' }}>(optional)</span>}
      </label>
      <input id={inputId} type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border-hover)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F0F0F0', paddingBottom: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
        {number}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
    </div>
  );
}

/* ══ Page export ═════════════════════════════════════════════════════════ */
export default function SOPBuilderPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(124,58,237,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <SOPBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}
