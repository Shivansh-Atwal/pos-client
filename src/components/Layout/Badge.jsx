import React from 'react'

/**
 * Badge Component
 * Display status or category badges
 */
function Badge({ text, variant = 'default', className = '' }) {
  const classes = [`badge`, variant !== 'default' && `badge-${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return <span className={classes}>{text}</span>
}

export default Badge
