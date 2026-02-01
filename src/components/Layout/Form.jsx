import React, { useState } from 'react'

/**
 * Form Component
 * Wrapper for managing form state
 */
function Form({ onSubmit, children, className = '' }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  )
}

export default Form
