import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Download, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Bills.css'

function Bills() {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedBillId, setExpandedBillId] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    startDate: '',
    endDate: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Fetch bills from backend
  useEffect(() => {
    fetchBills()
  }, [filters, pagination.page])

  const fetchBills = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { paymentStatus: filters.status }),
        ...(filters.method && { paymentMethod: filters.method }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const response = await fetch(
        `http://localhost:5000/api/bills/all?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch bills')
        return
      }

      setBills(data.data || [])
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
        }))
      }
    } catch (err) {
      setError('Error fetching bills: ' + err.message)
      console.error('Fetch bills error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const toggleBillDetails = (billId) => {
    setExpandedBillId(expandedBillId === billId ? null : billId)
  }

  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(
        'http://localhost:5000/api/bills/export/csv',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        alert('Failed to export bills')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bills-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
      alert('Error exporting bills')
    }
  }

  const getStatusBadge = (status) => {
    const statusClass = status === 'Completed' ? 'badge-completed' : 'badge-pending'
    return <span className={`status-badge ${statusClass}`}>{status}</span>
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="bills-container">
      {/* Header */}
      <div className="bills-header">
        <h2>Bills Management</h2>
        {/* <button className="export-btn" onClick={exportToCSV}>
          <Download size={18} />
          Export to CSV
        </button> */}
      </div>

      {/* Filters */}
      <div className="filters-section">
        {/* <div className="filter-group">
          <label htmlFor="status">Payment Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div> */}

        {/* <div className="filter-group">
          <label htmlFor="method">Payment Method</label>
          <select
            id="method"
            name="method"
            value={filters.method}
            onChange={handleFilterChange}
          >
            <option value="">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div> */}

        <div className="filter-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>

        {/* <div className="filter-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div> */}

        <button
          className="reset-btn"
          onClick={() => {
            setFilters({ status: '', method: '', startDate: '', endDate: '' })
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <Loader size={40} className="spinner" />
          <p>Loading bills...</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="empty-state">
          <p>No bills found</p>
        </div>
      ) : (
        <>
          {/* Bills List */}
          <div className="bills-list">
            {bills.map((bill) => (
              <div key={bill._id} className="bill-item">
                <div
                  className="bill-header"
                  onClick={() => toggleBillDetails(bill._id)}
                >
                  <div className="bill-info">
                    <h3>Bill #{bill.billNumber}</h3>
                    <p className="bill-date">
                      {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="bill-meta">
                    <div className="bill-amount">
                      <span className="label">Total:</span>
                      <span className="amount">₹{bill.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    {getStatusBadge(bill.paymentStatus)}
                    <button className="expand-btn">
                      {expandedBillId === bill._id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBillId === bill._id && (
                  <div className="bill-details">
                    {/* Customer Info */}
                    <div className="details-section">
                      <h4>Customer Information</h4>
                      <div className="detail-row">
                        <span className="label">Name:</span>
                        <span>{bill.customerName || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Mobile:</span>
                        <span>{bill.customerMobile || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="details-section">
                      <h4>Items</h4>
                      <div className="items-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bill.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.productName}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.unitPrice?.toFixed(2)}</td>
                                <td>₹{(item.quantity * item.unitPrice)?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="details-section">
                      <h4>Bill Summary</h4>
                      <div className="detail-row">
                        <span className="label">Subtotal:</span>
                        <span>₹{bill.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Tax (GST):</span>
                        <span>₹{bill.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      {bill.discount > 0 && (
                        <div className="detail-row">
                          <span className="label">Discount:</span>
                          <span>-₹{bill.discount?.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="detail-row total">
                        <span className="label">Total:</span>
                        <span>₹{bill.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    {/* <div className="details-section">
                      <h4>Payment Information</h4>
                      <div className="detail-row">
                        <span className="label">Method:</span>
                        <span>{bill.paymentMethod}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Status:</span>
                        <span>{getStatusBadge(bill.paymentStatus)}</span>
                      </div>
                    </div> */}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>

              <div className="page-info">
                Page <span>{pagination.page}</span> of <span>{totalPages}</span>
              </div>

              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Bills
