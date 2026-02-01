import React from 'react'

/**
 * Card Component
 * Reusable card with header, body, and footer
 */
function Card({ header, children, footer, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {header && <div className="card-header">{header}</div>}
      {children && <div className="card-body">{children}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

export default Card
