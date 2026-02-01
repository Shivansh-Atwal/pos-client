import React from 'react'

/**
 * FormField Component
 * Input wrapper with label and error handling
 */
function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  hint,
  placeholder,
  disabled = false,
  required = false,
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && '*'}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="form-control"
      />
      {error && <div className="form-error">{error}</div>}
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  )
}

export default FormField
