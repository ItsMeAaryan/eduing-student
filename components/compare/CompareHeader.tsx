import React from 'react';
import { ArrowLeft, X, Share2, Download } from 'lucide-react';

/** Slim top action bar — no university cards here (they live in the table thead) */
export function CompareHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-5 h-[52px]"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Back */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-[13px] font-semibold transition-colors group"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        aria-label="Back to Universities"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Back to Universities</span>
      </button>

      {/* Centre label */}
      <p
        className="absolute left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-widest uppercase hidden md:block select-none"
        style={{ color: 'var(--text-muted)' }}
      >
        University Comparison
      </p>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {[
          { icon: <Share2 size={13} />, label: 'Share' },
          { icon: <Download size={13} />, label: 'Export' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="hidden md:flex items-center gap-1.5 text-[12px] font-semibold px-3 h-8 rounded-lg transition-colors"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            {icon} {label}
          </button>
        ))}
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
