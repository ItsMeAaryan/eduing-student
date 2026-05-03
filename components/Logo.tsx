'use client'
import Link from 'next/link'

export default function Logo({ height = 32, href = "/", onClick }: { height?: number; href?: string; onClick?: () => void }) {
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
      {/* Icon mark */}
      <div style={{
        width: `${height}px`,
        height: `${height}px`,
        borderRadius: `${8 * scale}px`,
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${16 * scale}px`,
        fontWeight: '900',
        color: 'white',
        flexShrink: 0,
        boxShadow: `0 0 ${16 * scale}px rgba(79,70,229,0.4)`,
        position: 'relative',
      }}>
        E
        {/* Gold dot accent */}
        <div style={{
          position: 'absolute',
          top: `-${3 * scale}px`,
          right: `-${3 * scale}px`,
          width: `${8 * scale}px`,
          height: `${8 * scale}px`,
          borderRadius: '50%',
          background: '#F59E0B',
          border: `${1.5 * scale}px solid #0A0A0F`,
        }} />
      </div>

      {/* Text */}
      <span style={{ lineHeight: 1 }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: `${19 * scale}px`,
          fontWeight: '900',
          letterSpacing: '-0.03em',
          color: '#FAFAFA',
        }}>EDU</span>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: `${19 * scale}px`,
          fontWeight: '900',
          letterSpacing: '-0.03em',
          color: '#6366F1',
        }}>ING</span>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: `${13 * scale}px`,
          fontWeight: '700',
          color: '#F59E0B',
          letterSpacing: '0',
        }}>.in</span>
      </span>
    </Link>
  )
}
