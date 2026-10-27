import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared button. Renders <button> by default, or a router <Link> when `to` is given.
 * `loading` shows a spinner and disables interaction while keeping the label for layout stability.
 */
export default function Button({
  variant = 'primary',
  size,
  loading = false,
  icon: Icon,
  to,
  full = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size && `btn-${size}`,
    full && 'btn-full',
    loading && 'is-loading',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : Icon && <Icon size={16} aria-hidden="true" />}
      {children && <span className="btn-label">{children}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
