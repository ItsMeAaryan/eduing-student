'use client'
import Link from 'next/link'
import Image from 'next/image'

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
      {/* Logo Image */}
      <Image
        src="/bandwlogo.PNG"
        alt="EDUING Logo"
        width={height}
        height={height}
        style={{ objectFit: 'contain', filter: 'invert(1)' }}
      />
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
        <span style={{
          color: '#F59E0B',
      }}
      </span>
    </Link>
  )
}
