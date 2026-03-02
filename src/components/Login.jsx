import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

function Login({ onLoginSuccess, onNavigateToSignup }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Save token and session to localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId)
      }

      onLoginSuccess(data.user, data.sessionId)
    } catch (err) {
      setError('Connection error. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container bill-auth-container">
      <div className="bill-watermark">sPOS</div>
      
      <div className="bill-card login-bill-card">
        {/* Bill Header */}
        <div className="bill-receipt-header">
          <div className="receipt-logo">
            <span>sPOS</span>
          </div>
          <h1 className="receipt-title">LOGIN ACCESS</h1>
          <div className="receipt-line"></div>
        </div>
        
        {error && <div className="bill-error-message"><span>⚠</span> {error}</div>}
        
        <form onSubmit={handleSubmit} className="bill-form">
          {/* Form Fields as Bill Items */}
          <div className="bill-form-section">
            <div className="bill-form-group">
              <label className="bill-field-label">USERNAME</label>
              <div className="bill-input-wrapper">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  disabled={loading}
                  autoComplete="username"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="bill-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              'ACCESSING ACCOUNT >'
            )}
          </button>
        </form>

        {/* Bill Footer */}
        <div className="bill-receipt-footer">
          <p className="receipt-line dashed"></p>
          <p className="receipt-footer-text">
            <button onClick={onNavigateToSignup} className="bill-footer-link">Create New Account →</button>
          </p>
          <p className="receipt-footer-text footer-small">Thank you for using sPOS</p>
        </div>
      </div>
    </div>
  )
}

export default Login
