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
    <div className="auth-container login-container">
      <div className="auth-watermark">sPOS</div>
      <div className="login-background"></div>
      
      <div className="auth-card login-card">
        <div className="login-header">
          <div className="logo-circle">
            <span>sP</span>
          </div>
          <h1>sPOS</h1>
          <p>Smart Point of Sale System</p>
        </div>
        
        {error && <div className="error-message"><span>⚠</span> {error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
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

          <button 
            type="submit" 
            className="auth-btn login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                PROCESSING...
              </>
            ) : (
              'LOGIN'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <button onClick={onNavigateToSignup} className="link-btn">Sign up</button></p>
        </div>
      </div>
    </div>
  )
}

export default Login
