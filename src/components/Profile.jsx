import React, { useState, useEffect } from 'react'
import { X, LogOut, Save, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import SalesReport from './SalesReport'
import './Auth.css'

function Profile({ isOpen, onClose, onLogout }) {
  const { user, updateUser } = useAuth()
  const [showSalesReport, setShowSalesReport] = useState(false)
  const [formData, setFormData] = useState({
    shopName: '',
    shopAddress: '',
    phone: '',
    gstNumber: '',
    shopEmail: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        shopName: user.shopName || '',
        shopAddress: user.shopAddress || '',
        phone: user.phone || '',
        gstNumber: user.gstNumber || '',
        shopEmail: user.shopEmail || '',
      })
    }
  }, [isOpen, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        return
      }

      // Update user in context
      updateUser(formData)
      
      setMessage('Profile updated successfully!')
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (err) {
      setError('Error updating profile: ' + err.message)
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // If showing sales report, display it in fullscreen
  if (showSalesReport) {
    return (
      <div className="sales-report-modal-wrapper">
        <div className="sales-report-modal-header">
          <button 
            className="back-btn"
            onClick={() => setShowSalesReport(false)}
            title="Back to Profile"
          >
            ← Back to Profile
          </button>
        </div>
        <SalesReport />
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            {/* Shop Information Section */}
            <div className="form-section">
              <h3 className="section-title">Shop Information</h3>

              <div className="form-group">
                <label htmlFor="shopName">Shop Name *</label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Enter your shop name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shopAddress">Address</label>
                <textarea
                  id="shopAddress"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  placeholder="Enter your shop address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Mobile Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    pattern="[0-9+\-() ]+"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gstNumber">GST Number</label>
                  <input
                    type="text"
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                </div>
              </div>

              {/* <div className="form-group">
                <label htmlFor="shopEmail">Email</label>
                <input
                  type="email"
                  id="shopEmail"
                  name="shopEmail"
                  value={formData.shopEmail}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div> */}
            </div>

            {/* User Display Information (Read-only) */}
            <div className="form-section">
              <h3 className="section-title">Account Information</h3>
              <div className="read-only-info">
                <div className="info-item">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{user?.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                {/* <div className="info-item">
                  <span className="info-label">Role:</span>
                  <span className="info-value">{user?.role || 'User'}</span>
                </div> */}
              </div>
            </div>

            {/* Buttons */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Logout Section */}
          <div className="logout-section">
            <hr className="divider" />
            <button 
              className="sales-report-btn-profile" 
              onClick={() => setShowSalesReport(true)}
              title="View sales report"
            >
              <BarChart3 size={18} />
              <span>View Sales Report</span>
            </button>
            <button className="logout-btn-profile" onClick={onLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
