import React from 'react'
import { LogOut } from 'lucide-react'

function Navbar({ userName, onLogout }) {
  return (
    <nav className="billing-navbar">
      <div className="navbar-content">
        {/* Company Name */}
        <div className="navbar-brand">
          <h1 className="company-name">sPOS System</h1>
        </div>

        {/* User Info and Logout */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-label">User:</span>
            <span className="user-id">{userName || 'Guest'}</span>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
