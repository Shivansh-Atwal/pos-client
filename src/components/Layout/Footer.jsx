import React from 'react'

/**
 * Footer Component
 * Simple footer with links and text
 */
function Footer({ copyrightText, links = [] }) {
  return (
    <footer className="footer">
      <div style={{ marginBottom: '8px' }}>
        {links.map((link, index) => (
          <span key={index}>
            <a href={link.href}>{link.label}</a>
            {index < links.length - 1 && ' • '}
          </span>
        ))}
      </div>
      {copyrightText && <p>{copyrightText}</p>}
    </footer>
  )
}

export default Footer
