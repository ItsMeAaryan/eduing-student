'use client';

import React, { useState, useMemo, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useToast } from '@/hooks/useToast';
import { EmailService } from '@/lib/ai/gemini/services';
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout';
import {
  Mail, Wand2, Copy, RefreshCw, Trash2, Save, MessageSquareText,
  Sparkles, AlertCircle, CheckCircle2, GraduationCap, Building2,
  Briefcase, Trophy, RotateCcw, Clock, User, BookOpen, X,
  ChevronDown, FileText,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────────────── */
interface Draft {
  id: string;
  timestamp: number;
  recipientType: string;
  purpose: string;
  recipientName: string;
  subject: string;
  body: string;
}

/* ── Constants ──────────────────────────────────────────────────── */
const RECIPIENT_TYPES = [
  { id: 'Professor',             label: 'Professor',             icon: GraduationCap, emoji: '🎓', desc: 'Faculty / Research advisor' },
  { id: 'Admin',                 label: 'Admin',                 icon: Building2,     emoji: '🏢', desc: 'Admissions / Office staff' },
  { id: 'HOD',                   label: 'HOD',                   icon: Briefcase,     emoji: '👔', desc: 'Head of Department' },
  { id: 'Scholarship Committee', label: 'Scholarship Committee', icon: Trophy,        emoji: '🏆', desc: 'Financial aid committee' },
];

const PURPOSES = [
  { id: 'Inquiry',     label: 'Inquiry',     color: '#6366F1', desc: 'Ask about programs, seats, fees' },
  { id: 'Application', label: 'Application', color: '#10B981', desc: 'Submit or follow up on application' },
  { id: 'Follow-up',  label: 'Follow-up',   color: '#F59E0B', desc: 'Check status after prior contact' },
  { id: 'Thank You',  label: 'Thank You',   color: '#EC4899', desc: 'Express gratitude' },
  { id: 'Request',    label: 'Request',     color: '#0EA5E9', desc: 'LOR, fee waiver, etc.' },
];

/* ── Helpers ────────────────────────────────────────────────────── */
function readTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  const secs = Math.ceil(words / 3.5);
  return secs < 60 ? `${secs}s read` : `${Math.ceil(secs / 60)}m read`;
}

function saveDraft(draft: Omit<Draft, 'id' | 'timestamp'>) {
  const all: Draft[] = JSON.parse(localStorage.getItem('email_drafts') || '[]');
  const newDraft: Draft = { ...draft, id: crypto.randomUUID(), timestamp: Date.now() };
  all.unshift(newDraft);
  localStorage.setItem('email_drafts', JSON.stringify(all.slice(0, 20)));
  return newDraft;
}

function loadDrafts(): Draft[] {
  return JSON.parse(localStorage.getItem('email_drafts') || '[]');
}

function deleteDraft(id: string) {
  const all: Draft[] = JSON.parse(localStorage.getItem('email_drafts') || '[]');
  localStorage.setItem('email_drafts', JSON.stringify(all.filter(d => d.id !== id)));
}

/* ── Score badge ────────────────────────────────────────────────── */
function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
      <p style={{ fontSize: 22, fontWeight: 800, color, margin: '0 0 2px', lineHeight: 1 }}>{score}</p>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
function EmailAssistantContent() {
  const { profile } = useStudentData();
  const { toast } = useToast();

  // ── Left panel state
  const [recipientType, setRecipientType] = useState('Professor');
  const [purpose, setPurpose] = useState('Inquiry');
  const [recipientName, setRecipientName] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // ── Center panel state
  const [toField, setToField] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [generated, setGenerated] = useState(false);

  // ── Right panel state
  const [rightTab, setRightTab] = useState<'assistant' | 'tone'>('assistant');
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // ── AI state — email generation (direct, not via useAIGeneration to avoid callback timing bugs)
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  // ── AI state — tone check
  const { data: toneData, isGenerating: isToneChecking, generate: generateTone } = useAIGeneration<any>();

  // ── Character / read time
  const charCount = body.length;
  const estimatedRead = body.trim() ? readTime(body) : '—';

  // ── Generate
  const handleGenerate = useCallback(async () => {
    if (!profile) { toast.error('Profile not loaded yet. Please wait.'); return; }
    if (!recipientName.trim()) { toast.error('Please enter a recipient name / university.'); return; }

    setIsGenerating(true);
    setGenError(null);

    const p = profile as any;
    const aiContext = {
      studentProfile: profile,
      studentName:    p.fullName   || '',
      academicStream: p.stream     || '',
      targetDegree:   p.targetDegree  || '',
      bachelorDegree: p.bachelorDegree || '',
      bachelorCgpa:   p.bachelorCgpa  || '',
      twelfthScore:   p.twelfthScore  || '',
      twelfthBoard:   p.twelfthBoard  || '',
      jeeScore:       p.jeeScore   || '',
      cuetScore:      p.cuetScore  || '',
      neetScore:      p.neetScore  || '',
      gateScore:      p.gateScore  || '',
      city:           p.city       || '',
      state:          p.state      || '',
      recipientType,
      purpose,
      recipientName,
      additionalContext,
    };
    const intent = `${purpose} email to ${recipientType} (${recipientName})${
      additionalContext ? `. Additional context: ${additionalContext}` : ''
    }`;

    try {
      const result = await EmailService.generateEmail(aiContext, intent);

      if (!result.success) {
        const msg = 'Email generation failed. Please try again.';
        setGenError(msg);
        toast.error(msg);
        return;
      }

      // result.data is the parsed JSON object { subject, body }
      const parsed = result.data as { subject?: string; body?: string } | null;

      // Fallback: if data is null, try extracting from raw text
      let emailSubject = parsed?.subject || '';
      let emailBody    = parsed?.body    || '';

      if ((!emailSubject || !emailBody) && result.text) {
        // Try parsing raw text as JSON one more time
        try {
          const raw = JSON.parse(result.text.replace(/```json|```/g, '').trim());
          emailSubject = emailSubject || raw.subject || '';
          emailBody    = emailBody    || raw.body    || '';
        } catch { /* ignore */ }
      }

      if (!emailSubject && !emailBody) {
        const msg = 'AI returned an empty response. Please regenerate.';
        setGenError(msg);
        toast.error(msg);
        return;
      }

      setSubject(emailSubject);
      setBody(emailBody);
      setGenerated(true);
      setGenError(null);
    } catch (err: any) {
      const msg = 'Something went wrong. Please try again later.';
      setGenError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [profile, recipientType, purpose, recipientName, additionalContext, toast]);

  // ── Regenerate (same inputs)
  const handleRegenerate = () => handleGenerate();

  // ── Copy
  const handleCopy = () => {
    const full = `To: ${toField}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(full)
      .then(() => toast.success('Email copied to clipboard!'))
      .catch(() => toast.error('Failed to copy.'));
  };

  // ── Save draft
  const handleSaveDraft = () => {
    if (!subject && !body) { toast.error('Nothing to save.'); return; }
    saveDraft({ recipientType, purpose, recipientName, subject, body });
    toast.success('Draft saved!');
    setDrafts(loadDrafts());
  };

  // ── Reload draft
  const handleLoadDraft = (d: Draft) => {
    setRecipientType(d.recipientType);
    setPurpose(d.purpose);
    setRecipientName(d.recipientName);
    setSubject(d.subject);
    setBody(d.body);
    setGenerated(true);
    setShowDrafts(false);
    toast.success('Draft loaded.');
  };

  // ── Clear
  const handleClear = () => {
    setSubject(''); setBody(''); setToField(''); setGenerated(false);
  };

  // ── Tone check
  const handleToneCheck = async () => {
    if (!body.trim()) { toast.error('Write or generate an email first.'); return; }
    setRightTab('tone');
    await generateTone(() => EmailService.reviewEmail(`Subject: ${subject}\n\n${body}`, { studentProfile: profile }));
  };

  // ── Open drafts panel
  const handleOpenDrafts = () => {
    setDrafts(loadDrafts());
    setShowDrafts(true);
  };

  // ── Profile context snippet — uses real Firestore field names
  const profileSnippet = useMemo(() => {
    const p = profile || {};
    return {
      name:        p.fullName || 'Not set',
      degree:      p.bachelorDegree || p.targetDegree || p.stream || 'Not set',
      institution: p.twelfthBoard
                     ? `${p.twelfthBoard}${p.city ? ', ' + p.city : ''}`
                     : (p.city || p.state ? [p.city, p.state].filter(Boolean).join(', ') : 'Not set'),
      cgpa:        p.bachelorCgpa || null,
      jee:         p.jeeScore || null,
      twelfthScore:p.twelfthScore || null,
      stream:      p.stream || null,
      targetDegree:p.targetDegree || null,
      city:        p.city || null,
      state:       p.state || null,
    };
  }, [profile]);

  // ── The left-panel "Generate" button disabled state
  const canGenerate = !!recipientName.trim() && !isGenerating;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: 'Inter, system-ui, sans-serif', height: 'calc(100vh - 120px)', minHeight: 560 }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <AIWorkspaceLayout
        title="Email Writer"
        icon={<Mail size={16} strokeWidth={1.8} />}
        themeColor="emerald"
        headerActions={
          <>
            <button
              onClick={handleOpenDrafts}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 34, padding: '0 14px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
              }}
            >
              <Save size={14} /> Drafts
            </button>
          </>
        }
      />

      {/* ── Three-panel layout ──────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', marginTop: 16 }}>

        {/* ════ LEFT PANEL ════════════════════════════════════════ */}
        <div style={{ width: 260, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-card)' }}>
          <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Recipient Type */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                Recipient Type
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {RECIPIENT_TYPES.map(r => {
                  const active = recipientType === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRecipientType(r.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 10px', borderRadius: 8, cursor: 'pointer', border: 'none',
                        background: active ? 'rgba(16,185,129,0.08)' : 'transparent',
                        outline: active ? '1.5px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                        transition: 'all 0.15s', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: active ? 'rgba(16,185,129,0.12)' : 'var(--bg)',
                        border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14,
                      }}>{r.emoji}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: active ? '#10B981' : 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>{r.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0' }}>{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                Purpose
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {PURPOSES.map(p => {
                  const active = purpose === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPurpose(p.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px', borderRadius: 7, cursor: 'pointer', border: 'none',
                        background: active ? `${p.color}14` : 'transparent',
                        outline: active ? `1.5px solid ${p.color}55` : '1px solid transparent',
                        transition: 'all 0.15s', textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? p.color : 'var(--border)', flexShrink: 0 }} />
                        <p style={{ fontSize: 13, fontWeight: 600, color: active ? p.color : 'var(--text-primary)', margin: 0 }}>{p.label}</p>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, maxWidth: 90, textAlign: 'right', lineHeight: 1.3 }}>{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Name */}
            <div>
              <label htmlFor="recipientName" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Recipient Name / University <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                id="recipientName"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="e.g. Prof. Sharma, IIT Delhi"
                style={{
                  width: '100%', height: 34, padding: '0 10px', boxSizing: 'border-box',
                  background: 'var(--bg-elevated)', border: `1px solid ${recipientName ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                  borderRadius: 7, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>

            {/* Additional Context */}
            <div>
              <label htmlFor="additionalContext" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Additional Context <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none' }}>(optional)</span>
              </label>
              <textarea
                id="additionalContext"
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                placeholder="e.g. I'm applying for B.Tech CSE for 2025 intake"
                rows={3}
                style={{
                  width: '100%', padding: '8px 10px', boxSizing: 'border-box',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 7, fontSize: 12, color: 'var(--text-primary)', outline: 'none',
                  resize: 'vertical', lineHeight: 1.5,
                }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', height: 40, borderRadius: 9, cursor: canGenerate ? 'pointer' : 'not-allowed',
                border: 'none',
                background: canGenerate ? 'linear-gradient(135deg, #10B981, #059669)' : 'var(--bg-elevated)',
                color: canGenerate ? '#fff' : 'var(--text-muted)',
                fontSize: 14, fontWeight: 700, boxShadow: canGenerate ? '0 4px 14px rgba(16,185,129,0.35)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isGenerating
                ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Drafting…</>
                : <><Wand2 size={15} /> Generate Email</>
              }
            </button>
          </div>
        </div>

        {/* ════ CENTER PANEL ═══════════════════════════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

          {/* ── Empty state ── */}
          {!generated && !isGenerating && !genError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={24} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Message</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
                Select a recipient type and purpose, then click <strong style={{ color: '#10B981' }}>Generate Email</strong>
              </p>
            </div>
          )}

          {/* ── Error state ── */}
          {genError && !isGenerating && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 10 }}>
              <AlertCircle size={36} style={{ color: '#EF4444', opacity: 0.6 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Something went wrong</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Please try again.</p>
            </div>
          )}

          {/* ── Loading overlay ── */}
          {isGenerating && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--bg-card-rgb,255,255,255),0.85)', backdropFilter: 'blur(6px)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, border: '3px solid rgba(16,185,129,0.25)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#10B981', margin: 0 }}>Composing your email…</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>This takes a few seconds</p>
            </div>
          )}

          {/* ── Email editor ── */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: !generated ? 0.15 : 1, pointerEvents: !generated ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
            {/* To */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border)', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>To:</span>
              <input
                type="email"
                value={toField}
                onChange={e => setToField(e.target.value)}
                placeholder="university@admissions.edu"
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            {/* Subject */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border)', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject…"
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            {/* Body */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Compose your email…"
                style={{
                  width: '100%', height: '100%', padding: '18px 20px', boxSizing: 'border-box',
                  background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                  fontSize: 14, lineHeight: 1.85, color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            {/* Stats + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg)', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{charCount.toLocaleString()} chars</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>
                  <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{estimatedRead}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleCopy}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 7, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  <Copy size={12} /> Copy Email
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 7, cursor: 'pointer', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)', fontSize: 12, fontWeight: 600, color: '#10B981' }}
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button
                  onClick={handleSaveDraft}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 7, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  <Save size={12} /> Save Draft
                </button>
                <button
                  onClick={handleClear}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 10px', borderRadius: 7, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', fontSize: 12, fontWeight: 600, color: '#EF4444' }}
                >
                  <Trash2 size={12} /> Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════════════════════════════════════════ */}
        <div style={{ width: 280, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {(['assistant', 'tone'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                style={{
                  flex: 1, padding: '12px 0', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer',
                  border: 'none', background: 'transparent',
                  color: rightTab === tab ? '#10B981' : 'var(--text-muted)',
                  borderBottom: rightTab === tab ? '2px solid #10B981' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab === 'assistant' ? 'Assistant' : 'Tone Check'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
            {/* ── ASSISTANT tab ── */}
            {rightTab === 'assistant' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Context card */}
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Sparkles size={13} style={{ color: '#10B981' }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-Included Context</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <ContextLine icon={User} label="Name" value={profileSnippet.name} />
                    <ContextLine icon={GraduationCap} label="Degree" value={profileSnippet.degree} />
                    <ContextLine icon={Building2} label="Institution" value={profileSnippet.institution} />
                    {profileSnippet.stream && <ContextLine icon={BookOpen} label="Stream" value={profileSnippet.stream} />}
                    {profileSnippet.targetDegree && <ContextLine icon={Trophy} label="Target" value={profileSnippet.targetDegree} />}
                    {profileSnippet.cgpa && <ContextLine icon={BookOpen} label="CGPA" value={`${profileSnippet.cgpa}`} />}
                    {profileSnippet.twelfthScore && <ContextLine icon={FileText} label="12th Score" value={`${profileSnippet.twelfthScore}%`} />}
                    {profileSnippet.jee && <ContextLine icon={FileText} label="JEE Main" value={`${profileSnippet.jee}`} />}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.5 }}>
                    This context is automatically woven into your email by the AI.
                  </p>
                </div>

                {/* Tone Check button here too */}
                <button
                  onClick={handleToneCheck}
                  disabled={isToneChecking || !body.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    width: '100%', height: 36, borderRadius: 8, cursor: body.trim() ? 'pointer' : 'not-allowed',
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    fontSize: 13, fontWeight: 600, color: body.trim() ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {isToneChecking
                    ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(16,185,129,0.3)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Analyzing…</>
                    : <><MessageSquareText size={14} /> Run Tone Check</>
                  }
                </button>

                {/* Tips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Keep subject lines under 60 characters',
                    'Address the recipient by full title (Prof. / Dr.)',
                    'State your purpose clearly in the first sentence',
                    'End with a clear call to action',
                  ].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <CheckCircle2 size={13} style={{ color: '#10B981', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TONE CHECK tab ── */}
            {rightTab === 'tone' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!toneData && !isToneChecking && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <MessageSquareText size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>No analysis yet</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.6 }}>Write or generate an email, then run Tone Check.</p>
                    <button
                      onClick={handleToneCheck}
                      disabled={!body.trim()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 16px',
                        borderRadius: 8, cursor: body.trim() ? 'pointer' : 'not-allowed',
                        border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.07)',
                        fontSize: 13, fontWeight: 600, color: '#10B981',
                      }}
                    >
                      <MessageSquareText size={13} /> Run Tone Check
                    </button>
                  </div>
                )}

                {isToneChecking && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#10B981', margin: 0 }}>Analyzing tone…</p>
                  </div>
                )}

                {toneData && !isToneChecking && (
                  <AnimatePresence>
                    <motion.div key="tone-results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Score grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <ScoreBadge label="Professional" score={toneData.professionalismScore ?? toneData.professionalism ?? 0} />
                        <ScoreBadge label="Grammar" score={toneData.grammarScore ?? toneData.grammar ?? 0} />
                        <ScoreBadge label="Tone" score={toneData.toneScore ?? toneData.tone ?? 0} />
                        <ScoreBadge label="Clarity" score={toneData.clarityScore ?? toneData.clarity ?? 80} />
                      </div>

                      {/* Readability */}
                      {toneData.readability && (
                        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Readability</p>
                          <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>{toneData.readability}</p>
                        </div>
                      )}

                      {/* Suggestions */}
                      {(toneData.suggestedImprovements || toneData.improvements || []).length > 0 && (
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Suggestions</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(toneData.suggestedImprovements || toneData.improvements || []).slice(0, 4).map((s: string, i: number) => (
                              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px' }}>
                                <AlertCircle size={12} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alternative subjects */}
                      {(toneData.alternativeSubjectLines || []).length > 0 && (
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Alt. Subject Lines</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {toneData.alternativeSubjectLines.map((s: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => setSubject(s)}
                                style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}
                              >
                                &quot;{s}&quot;
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Re-run */}
                      <button
                        onClick={handleToneCheck}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 34, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}
                      >
                        <RotateCcw size={12} /> Re-run Analysis
                      </button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Drafts Slide-over ──────────────────────────────────── */}
      <AnimatePresence>
        {showDrafts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrafts(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 51, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Saved Drafts</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{drafts.length} draft{drafts.length !== 1 ? 's' : ''} stored locally</p>
                </div>
                <button onClick={() => setShowDrafts(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {drafts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Save size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No drafts yet</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Save an email to see it here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {drafts.map(d => (
                      <div key={d.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {d.subject || '(No Subject)'}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                              {d.recipientType} · {d.purpose} · {new Date(d.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <button
                            onClick={() => { deleteDraft(d.id); setDrafts(loadDrafts()); }}
                            style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          >
                            <X size={12} style={{ color: 'var(--text-muted)' }} />
                          </button>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                          {d.body.slice(0, 120)}…
                        </p>
                        <button
                          onClick={() => handleLoadDraft(d)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 12px', borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)', fontSize: 12, fontWeight: 600, color: '#10B981' }}
                        >
                          <RotateCcw size={11} /> Load Draft
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ContextLine({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  if (!value || value === '[Name]' && label === 'Name') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={12} style={{ color: '#10B981', flexShrink: 0 }} strokeWidth={1.8} />
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, minWidth: 60 }}>{label}:</p>
      <p style={{ fontSize: 11, color: 'var(--text-primary)', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
    </div>
  );
}

export default function EmailAssistantPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <EmailAssistantContent />
      </Suspense>
    </ProtectedRoute>
  );
}
