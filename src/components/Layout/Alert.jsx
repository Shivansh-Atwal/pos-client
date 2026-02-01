import React from 'react'

/**
 * Alert Component
 * Shows messages with different severity levels
 */
function Alert({ type = 'info', message, onClose }) {
  const classes = `alert alert-${type}`

  return (
    <div className={classes}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'inherit',
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert
