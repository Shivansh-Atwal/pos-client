import React, { useState } from 'react'
import { Store, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

function Signup({ onSignupSuccess, onNavigateToLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          shopName: formData.shopName,
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setError(data.errors[0]?.msg || 'Signup failed')
        } else {
          setError(data.error || 'Signup failed')
        }
        return
      }

      // Save token and session to localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId)
      }

      onSignupSuccess(data.user, data.sessionId)
    } catch (err) {
      setError('Connection error. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container bill-auth-container">
      <div className="bill-watermark">sPOS</div>
      
      <div className="bill-card signup-bill-card">
        {/* Bill Header */}
        <div className="bill-receipt-header">
          <div className="receipt-logo">
            <span>sPOS</span>
          </div>
          <h1 className="receipt-title">ACCOUNT REGISTRATION</h1>
          <div className="receipt-line"></div>
        </div>
        
        {error && <div className="bill-error-message"><span>⚠</span> {error}</div>}
        
        <form onSubmit={handleSubmit} className="bill-form signup-form">
          {/* Form Fields as Bill Items */}
          <div className="bill-form-section">
            <div className="bill-form-group">
              <label className="bill-field-label">SHOP NAME</label>
              <div className="bill-input-wrapper">
                <input
                  id="shopName"
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Your shop/business name"
                  required
                  disabled={loading}
                  className="bill-input"
                />
              </div>
            </div>

            <div className="bill-form-group">
              <label className="bill-field-label">USERNAME</label>
              <div className="bill-input-wrapper">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                  autoComplete="username"
                  className="bill-input"
                />
              </div>
            </div>

            <div className="bill-form-group">
              <label className="bill-field-label">EMAIL</label>
              <div className="bill-input-wrapper">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="bill-input"
                />
              </div>
            </div>

            <div className="bill-form-group">
              <label className="bill-field-label">PHONE NUMBER</label>
              <div className="bill-input-wrapper">
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  disabled={loading}
                  autoComplete="tel"
                  className="bill-input"
                />
              </div>
            </div>

            <div className="bill-form-group">
              <label className="bill-field-label">PASSWORD</label>
              <div className="bill-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="bill-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="bill-form-group">
              <label className="bill-field-label">CONFIRM PASSWORD</label>
              <div className="bill-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="bill-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Bill Footer Total Section */}
          <div className="bill-form-footer">
            <div className="receipt-line dashed"></div>
          </div>

          <button 
            type="submit" 
            className="bill-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                PROCESSING...
              </>
            ) : (
              'REGISTER ACCOUNT >'
            )}
          </button>
        </form>

        {/* Bill Footer */}
        <div className="bill-receipt-footer">
          <p className="receipt-line dashed"></p>
          <p className="receipt-footer-text">
            <button onClick={onNavigateToLogin} className="bill-footer-link">← Already have an account? Sign In</button>
          </p>
          <p className="receipt-footer-text footer-small">Welcome to sPOS System</p>
        </div>
      </div>
    </div>
  )
}

export default Signup
