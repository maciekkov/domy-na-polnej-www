type BrandLogoProps = {
  tone?: 'light' | 'dark'
  compact?: boolean
}

export function BrandLogo({ tone = 'dark', compact = false }: BrandLogoProps) {
  const light = tone === 'light'
  const roof = light ? '#f4f1ea' : '#252a2c'
  const field = light ? '#d7c6a1' : '#5d673d'
  const slats = light ? '#d7c6a1' : '#b7824a'

  return (
    <span className={`brand-logo ${compact ? 'brand-logo--compact' : ''}`} aria-label="Domy na Polnej">
      <svg className="brand-logo__mark" viewBox="0 0 132 96" fill="none" aria-hidden="true">
        <path d="M18 52V34L66 10l48 24" stroke={roof} strokeWidth="6" />
        <path d="M65 32v28M77 36v27M89 40v26M101 44v25M113 48v24" stroke={slats} strokeWidth="6" strokeLinecap="round" />
        <path d="M12 68c20-9 46-10 93 2M9 78c25-10 55-10 110 4M20 88c23-8 52-8 104 3" stroke={field} strokeWidth="3.2" strokeLinecap="round" />
      </svg>
      <span className="brand-logo__wordmark" style={{ color: roof }}>
        <span>DOMY</span><span>NA POLNEJ</span>
      </span>
    </span>
  )
}
