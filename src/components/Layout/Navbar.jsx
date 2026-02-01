import React from 'react'
import '../../styles/codeforces.css'

/**
 * Navbar Component
 * Top navigation bar with logo and menu
 */
function Navbar({ brandName = 'CodeApp', menuItems = [], user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>{brandName}</span>
      </div>
      <ul className="navbar-menu">
        {menuItems.map((item, index) => (
          <li key={index}>
            <a href={item.href}>{item.label}</a>
            {index < menuItems.length - 1 && <span className="navbar-sep">|</span>}
          </li>
        ))}
      </ul>
      {user && (
        <div className="navbar-user">
          <span className="user-info">
            {user.fullName || user.username} <small>({user.role})</small>
          </span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
