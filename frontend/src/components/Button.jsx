import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-brand-accent text-white shadow-sm hover:bg-brand-accent-dark disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed',
  secondary:
    'bg-brand-primary text-white shadow-sm hover:bg-brand-primary-dark disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed',
  outline:
    'bg-white text-brand-text ring-1 ring-black/10 hover:bg-brand-cream disabled:opacity-40 disabled:cursor-not-allowed',
  light:
    'bg-white text-brand-text shadow-sm hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'text-brand-muted hover:text-brand-text hover:bg-brand-cream disabled:opacity-40 disabled:cursor-not-allowed',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3 text-base gap-2',
}

function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40',
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  const Tag = as
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  )
}

export default Button
