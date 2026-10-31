'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Logo({ height = 32, href = "/", onClick, iconOnly = false }: { height?: number; href?: string; onClick?: () => void; iconOnly?: boolean }) {
  const scale = height / 32;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="EDUING home"
      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: `${8 * scale}px` }}
    >
      <Image
        src="/eduing-logo.png"
        alt="EDUING Logo"
        width={990}
        height={1024}
        className="w-auto object-contain shrink-0"
        style={{ height: `${height}px` }}
        priority
      />
      {!iconOnly && (
        <span className="font-display flex items-baseline" style={{ lineHeight: 1, fontSize: `${20 * scale}px`, fontWeight: 700, letterSpacing: '-0.03em' }}>
          <span style={{ color: 'var(--text-primary)' }}>EDU</span>
          <span style={{ color: 'var(--accent)' }}>ING</span>
          <span style={{ color: 'var(--gold-bright)', fontSize: `${13 * scale}px`, fontWeight: 600, marginLeft: 1 }}>.in</span>
        </span>
      )}
    </Link>
  )
}
