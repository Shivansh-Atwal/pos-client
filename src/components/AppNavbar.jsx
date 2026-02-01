import React from 'react'
import { User } from 'lucide-react'
import './AppNavbar.css'

function AppNavbar({ companyName, onProfileClick }) {
  return (
    <nav className="app-navbar">
      <div className="navbar-content">
        {/* Company Name */}
        <div className="navbar-brand">
          <h1 className="company-name">{companyName}</h1>
        </div>

        {/* Profile Button */}
        <div className="navbar-actions">
          <button className="profile-btn" onClick={onProfileClick} title="Open Profile">
            <User size={18} />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar
