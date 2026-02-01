import React, { useState } from 'react'
import './App.css'
import './styles/codeforces.css'
import AppNavbar from './components/AppNavbar'
import BillingSystem from './components/BillingSystem'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import { useAuth } from './context/AuthContext'

function App() {
  const [authPage, setAuthPage] = useState(null) // 'login' or 'signup'
  const [showProfile, setShowProfile] = useState(false)
  const { user, isAuthenticated, login, logout } = useAuth()

  const handleLoginSuccess = (userData) => {
    const token = localStorage.getItem('authToken')
    login(userData, token)
    setAuthPage(null)
  }

  const handleLogout = () => {
    logout()
    setShowProfile(false)
    setAuthPage('login')
  }

  // Show login/signup pages
  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return <Signup onSignupSuccess={handleLoginSuccess} onNavigateToLogin={() => setAuthPage(null)} />
    }
    return <Login onLoginSuccess={handleLoginSuccess} onNavigateToSignup={() => setAuthPage('signup')} />
  }

  return (
    <div className="app">
      <AppNavbar 
        companyName="sPOS System"
        onProfileClick={() => setShowProfile(true)}
      />
      <Profile 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onLogout={handleLogout}
      />
      <BillingSystem />
    </div>
  )
}

export default App