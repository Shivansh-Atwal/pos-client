import React, { useState } from 'react'
import './Auth.css'

function Signup({ onSignupSuccess, onNavigateToLogin }) {
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
    <div className="auth-container">
      <div className="auth-card signup-card">
        <h1>sPOS</h1>
        <p>CREATE NEW ACCOUNT</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shopName">Shop Name</label>
              <input
                id="shopName"
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Your shop name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                disabled={loading}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : 'REGISTER ACCOUNT'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <button onClick={onNavigateToLogin} className="link-btn">Sign in</button>
        </p>
      </div>
    </div>
  )
}

export default Signup
