import React, { useState, useEffect } from 'react'
import { Search, Download, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './SalesReport.css'

function SalesReport() {
  const { user } = useAuth()
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('units')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchSalesData()
  }, [dateRange])

  const fetchSalesData = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      const queryParams = new URLSearchParams({
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      })

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bills/all?limit=1000&${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch sales data')
        return
      }

      // Aggregate sales data by product
      const aggregatedSales = {}

      const bills = data.data || []
      bills.forEach((bill) => {
        if (bill.items && Array.isArray(bill.items)) {
          bill.items.forEach((item) => {
            const productKey = item.productId?._id || item.id || item.name
            const productName = item.productId?.name || item.name || 'Unknown'
            const price = item.productId?.price || item.price || 0

            if (!aggregatedSales[productKey]) {
              aggregatedSales[productKey] = {
                id: productKey,
                name: productName,
                unitsSold: 0,
                totalRevenue: 0,
                price: price,
              }
            }

            aggregatedSales[productKey].unitsSold += item.quantity || 0
            aggregatedSales[productKey].totalRevenue += (item.price || price) * (item.quantity || 0)
          })
        }
      })

      setSalesData(Object.values(aggregatedSales))
    } catch (err) {
      setError('Error fetching sales data: ' + err.message)
      console.error('Fetch sales error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = salesData
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'units':
          return b.unitsSold - a.unitsSold
        case 'revenue':
          return b.totalRevenue - a.totalRevenue
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const totalUnits = filteredData.reduce((sum, item) => sum + item.unitsSold, 0)
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalRevenue, 0)

  const exportToCSV = () => {
    const headers = ['Product Name', 'Units Sold', 'Unit Price', 'Total Revenue']
    const rows = filteredData.map((item) => [
      item.name,
      item.unitsSold,
      `₹${item.price.toFixed(2)}`,
      `₹${item.totalRevenue.toFixed(2)}`,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="sales-report">
      {/* Header */}
      <div className="report-header">
        <h2>Sales Report</h2>
        <button onClick={exportToCSV} className="export-btn" title="Export to CSV">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-range-filter">
        <div className="filter-group">
          <label htmlFor="startDate">From Date</label>
          <input
            id="startDate"
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">To Date</label>
          <input
            id="endDate"
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
        <button
          onClick={() => setDateRange({ startDate: '', endDate: '' })}
          className="clear-filter-btn"
        >
          Clear Filter
        </button>
      </div>

      {/* Stats Summary */}
      <div className="sales-stats">
        <div className="stat-box">
          <h3>Total Units Sold</h3>
          <p className="stat-value">{totalUnits}</p>
        </div>
        <div className="stat-box">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-box">
          <h3>Products Tracked</h3>
          <p className="stat-value">{filteredData.length}</p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="report-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sort-box">
          <label htmlFor="sortSelect">Sort by:</label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="units">Units Sold (High to Low)</option>
            <option value="revenue">Revenue (High to Low)</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="report-table-container">
        {loading ? (
          <div className="loading-state">
            <Package size={40} />
            <p>Loading sales data...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchSalesData} className="retry-btn">
              Retry
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>No sales data available</p>
          </div>
        ) : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Units Sold</th>
                <th>Unit Price</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="product-col">{item.name}</td>
                  <td className="units-col">{item.unitsSold}</td>
                  <td className="price-col">₹{item.price.toFixed(2)}</td>
                  <td className="revenue-col">₹{item.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default SalesReport
