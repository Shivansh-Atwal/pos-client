import React, { useEffect, useState } from 'react'
import { Search, Package, AlertTriangle } from 'lucide-react'
import '../styles/InventoryManager.css'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = 'http://localhost:5000'

function InventoryManager() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false)
  const [adjusting, setAdjusting] = useState(null)
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    filterInventory()
  }, [inventory, searchTerm, showLowStockOnly, showOutOfStockOnly])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success || Array.isArray(data)) {
        const items = Array.isArray(data) ? data : data.data || []
        setInventory(items)

        // Calculate stats
        const lowStockCount = items.filter(
          item => item.stock > 0 && item.stock <= 10
        ).length
        const outOfStockCount = items.filter(
          item => item.stock === 0
        ).length

        setStats({
          totalItems: items.length,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
        })
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInventory = () => {
    let filtered = inventory

    if (showLowStockOnly) {
      filtered = filtered.filter(item => item.stock > 0 && item.stock <= 10)
    }

    if (showOutOfStockOnly) {
      filtered = filtered.filter(item => item.stock === 0)
    }

    if (searchTerm) {
      filtered = filtered.filter(item => {
        const name = item.name || 'Unknown'
        const barcode = item.barcode || ''
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          barcode.includes(searchTerm)
        )
      })
    }

    setFilteredInventory(filtered)
  }

  const getStatusBadge = (stock) => {
    if (stock === 0) return { class: 'status-out-of-stock', text: 'Out of Stock' }
    if (stock <= 10) return { class: 'status-low-stock', text: 'Low Stock' }
    return { class: 'status-in-stock', text: 'In Stock' }
  }

  const handleAdjustQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 0) return
    
    setAdjusting(itemId)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/products/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newQuantity }),
      })

      if (response.ok) {
        // Update local inventory
        const updatedInventory = inventory.map(item =>
          item._id === itemId ? { ...item, stock: newQuantity } : item
        )
        setInventory(updatedInventory)
      }
    } catch (error) {
      console.error('Error adjusting quantity:', error)
    } finally {
      setAdjusting(null)
    }
  }


  return (
    <div className="inventory-manager">
      {/* Stats */}
      <div className="inv-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Items</p>
            <p className="stat-value">{stats.totalItems}</p>
          </div>
        </div>

        {/* <div className="stat-card danger">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Out of Stock</p>
            <p className="stat-value">{stats.outOfStock}</p>
          </div>
        </div> */}
      </div>

      {/* Search */}
      <div className="inv-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by product name or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Low Stock Filter */}
      <div className="low-stock-filter">
        <label>
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
          />
          Show only low stock items
        </label>
      </div>

      {/* Low Stock Filter */}
      <div className="low-stock-filter">
        <label>
          <input
            type="checkbox"
            checked={showOutOfStockOnly}
            onChange={(e) => setShowOutOfStockOnly(e.target.checked)}
          />
          Show only out of stock items
        </label>
      </div>

      {/* Inventory Table */}
      <div className="inv-table-container">
        {loading ? (
          <div className="loading">
            <Package size={40} />
            <p>Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>No inventory items found</p>
          </div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const status = getStatusBadge(item.stock)
                return (
                  <tr key={item._id}>
                    <td className="product-name">{item.name}</td>
                    <td>
                      <code className="barcode">{item.barcode || 'N/A'}</code>
                    </td>
                    <td>₹{item.price?.toFixed(2) || '0.00'}</td>
                    <td className="quantity-cell">
                      <div className="quantity-control-inline">
                        <button
                          className="qty-btn-sm"
                          onClick={() => handleAdjustQuantity(item._id, item.stock - 1)}
                          disabled={adjusting === item._id || item.stock === 0}
                        >
                          −
                        </button>
                        <span className="qty-value-sm">{item.stock}</span>
                        <button
                          className="qty-btn-sm"
                          onClick={() => handleAdjustQuantity(item._id, item.stock + 1)}
                          disabled={adjusting === item._id}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default InventoryManager
