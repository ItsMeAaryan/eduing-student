// components/ai/AIMarkdown.tsx
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface AIMarkdownProps {
  /** The raw markdown string from the AI response */
  content: string;
  /** Base font-size class, e.g. "text-[13px]" — defaults to text-[14px] */
  className?: string;
}

/**
 * Renders AI-generated markdown content with:
 *  - Bold, italic, headings, bullet lists, numbered lists, code blocks
 *  - Internal Next.js links (paths starting with /) use <Link>
 *  - External links open in a new tab
 */
export default function AIMarkdown({ content, className = '' }: AIMarkdownProps) {
  return (
    <div className={`ai-markdown leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          // ── Inline elements ─────────────────────────────────────────
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: 'inherit' }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          // ── Links ────────────────────────────────────────────────────
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            const isInternal = href.startsWith('/') || href.startsWith('#');
            if (isInternal) {
              return (
                <Link
                  href={href}
                  className="underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--accent)' }}
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--accent)' }}
              >
                {children}
              </a>
            );
          },
          // ── Headings ────────────────────────────────────────────────
          h1: ({ children }) => (
            <h1 className="text-[17px] font-bold mt-4 mb-2 first:mt-0" style={{ color: 'var(--text-primary)' }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[15px] font-semibold mt-3 mb-1.5 first:mt-0" style={{ color: 'var(--text-primary)' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[13px] font-semibold mt-2 mb-1 first:mt-0" style={{ color: 'var(--text-primary)' }}>{children}</h3>
          ),
          // ── Lists ────────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul className="flex flex-col gap-1 my-2 pl-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="flex flex-col gap-1 my-2 pl-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-1 before:absolute before:-left-3 before:content-['•'] before:opacity-50"
              style={{ color: 'inherit' }}>
              {children}
            </li>
          ),
          // ── Paragraphs ───────────────────────────────────────────────
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          // ── Code ─────────────────────────────────────────────────────
          code: ({ children, className: cls }) => {
            const isBlock = cls?.includes('language-');
            if (isBlock) {
              return (
                <pre className="rounded-lg p-3 my-2 text-[12px] overflow-x-auto"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="px-1 py-0.5 rounded text-[12px]"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                {children}
              </code>
            );
          },
          // ── Blockquote ───────────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 pl-3 my-2 italic opacity-75"
              style={{ borderColor: 'var(--accent)' }}>
              {children}
            </blockquote>
          ),
          // ── Horizontal rule ──────────────────────────────────────────
          hr: () => (
            <hr className="my-3 opacity-20" style={{ borderColor: 'var(--text-primary)' }} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
