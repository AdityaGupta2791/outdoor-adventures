function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  size = 'md',
  action,
  className = '',
}) {
  const titleSize =
    size === 'lg'
      ? 'text-3xl sm:text-4xl md:text-5xl'
      : size === 'sm'
        ? 'text-xl sm:text-2xl md:text-3xl'
        : 'text-2xl sm:text-3xl md:text-4xl'

  const wrapperAlign =
    align === 'center'
      ? 'text-center mx-auto max-w-2xl'
      : ''

  const containerCls =
    action && align !== 'center'
      ? `flex items-end justify-between gap-4 ${className}`
      : className

  const headerInner = (
    <div className={wrapperAlign}>
      {eyebrow && (
        <span className="text-xs uppercase tracking-wider font-semibold text-brand-primary">
          {eyebrow}
        </span>
      )}
      <h2
        className={`${eyebrow ? 'mt-3' : ''} font-display ${titleSize} font-semibold text-brand-text leading-tight`}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-brand-muted leading-relaxed">{description}</p>
      )}
    </div>
  )

  if (!action || align === 'center') {
    return <div className={containerCls}>{headerInner}</div>
  }

  return (
    <div className={containerCls}>
      {headerInner}
      <div className="shrink-0 hidden sm:block">{action}</div>
    </div>
  )
}

export default SectionHeader
