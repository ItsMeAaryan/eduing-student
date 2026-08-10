'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Logo({ height = 32, href = "/", onClick, iconOnly = false }: { height?: number; href?: string; onClick?: () => void; iconOnly?: boolean }) {
  const scale = height / 32;
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: `${8 * scale}px`,
      }}
    >
      {/* Logo Image */}
      <Image
        src="/bandwlogo.PNG"
        alt="EDUING Logo"
        width={326}
        height={429}
        className="w-auto object-contain mix-blend-multiply dark:invert dark:mix-blend-screen transition-all shrink-0"
        style={{ height: `${height}px` }}
        priority
      />
      {/* Text */}
      {!iconOnly && (
        <span className="flex items-center" style={{ lineHeight: 1 }}>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: `${19 * scale}px`,
            fontWeight: '900',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
          }}>EDU</span>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: `${19 * scale}px`,
            fontWeight: '900',
            letterSpacing: '-0.03em',
            color: '#6366F1',
          }}>ING</span>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: `${13 * scale}px`,
            fontWeight: '700',
            color: '#6366F1',
            letterSpacing: '0',
            alignSelf: 'flex-end',
            paddingBottom: `${3 * scale}px`
          }}>.in</span>
        </span>
      )}
    </Link>
  )
}
