// components/layout/Logo.tsx
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  textColor?: string
}

const sizes = {
  sm: { icon: 28, fontSize: '0.9rem', gap: '0.5rem' },
  md: { icon: 36, fontSize: '1.1rem', gap: '0.625rem' },
  lg: { icon: 48, fontSize: '1.4rem', gap: '0.75rem' },
}

export default function Logo({ size = 'md', showText = true, className, textColor }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn('flex items-center', className)} style={{ gap: s.gap }}>
      {/* Icon mark */}
      <div
        style={{
          width:  s.icon,
          height: s.icon,
          borderRadius: '28%',
          background: 'linear-gradient(135deg, #15803d 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgb(21 128 61 / 0.35)',
        }}
        aria-hidden="true"
      >
        {/* F&M SVG mark */}
        <svg
          width={Math.round(s.icon * 0.6)}
          height={Math.round(s.icon * 0.6)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield / leaf shape */}
          <path
            d="M12 2L4 5v7c0 4.5 3.3 8.7 8 9.9C17.7 20.7 21 16.5 21 12V5L12 2z"
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* F letter */}
          <path
            d="M7 9h4M7 12h3M7 9v6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* M letter */}
          <path
            d="M13 15V9l2.5 3.5L18 9v6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div style={{ color: textColor || 'var(--color-text)' }}>
          <div
            style={{
              fontSize: s.fontSize,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            F&amp;M
          </div>
          <div
            style={{
              fontSize: `calc(${s.fontSize} * 0.65)`,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: 0.65,
            }}
          >
            Fumigación
          </div>
        </div>
      )}
    </div>
  )
}
