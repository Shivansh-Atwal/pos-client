import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    const savedSessionId = localStorage.getItem('sessionId')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        if (savedSessionId) {
          setSessionId(savedSessionId)
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        localStorage.removeItem('sessionId')
      }
    }

    setLoading(false)
  }, [])

  const login = (userData, authToken, newSessionId) => {
    setUser(userData)
    setToken(authToken)
    setSessionId(newSessionId)
    localStorage.setItem('authToken', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    if (newSessionId) {
      localStorage.setItem('sessionId', newSessionId)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setSessionId(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('sessionId')
  }

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData }
    setUser(newUserData)
    localStorage.setItem('user', JSON.stringify(newUserData))
  }

  const value = {
    user,
    token,
    sessionId,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
