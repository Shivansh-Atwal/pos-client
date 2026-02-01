import React from 'react'

/**
 * Button Component
 * Reusable button with variants (primary, secondary) and sizes
 */
function Button({
  children,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'normal' && `btn-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
