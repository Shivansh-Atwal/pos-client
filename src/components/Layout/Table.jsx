import React from 'react'

/**
 * Table Component
 * Renders a simple data table with striping
 */
function Table({ headers, rows, striped = true, className = '' }) {
  return (
    <table className={`table ${striped ? 'table-striped' : ''} ${className}`}>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
