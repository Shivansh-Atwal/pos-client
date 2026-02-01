import React, { useState } from 'react'
import { Plus, Trash2, Search, X, Eye, EyeOff, Package } from 'lucide-react'
import ProductScanner from './ProductScanner'
import BillItems from './BillItems'
import BillDisplay from './BillDisplay'
import BillSidebar from './BillSidebar'
import PaymentModal from './PaymentModal'
import Bills from './Bills'
import InventoryManager from './InventoryManager'
import { useAuth } from '../context/AuthContext'
import './BillingSystem.css'

function BillingSystem() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('billing')
  const [billItems, setBillItems] = useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBillPreview, setShowBillPreview] = useState(true)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualProduct, setManualProduct] = useState({
    barcode: '',
    name: '',
    price: '',
  })
  const [scannedBarcode, setScannedBarcode] = useState(null)

  // Sample products database
  const products = [
    { id: 1, name: 'Lays - Classic Salt', price: 20, category: 'Snacks' },
    { id: 2, name: 'Sprite 600ml', price: 40, category: 'Beverages' },
    { id: 3, name: 'Biscuits Pack', price: 30, category: 'Snacks' },
    { id: 4, name: 'Milk 500ml', price: 25, category: 'Dairy' },
    { id: 5, name: 'Bread', price: 35, category: 'Bakery' },
    { id: 6, name: 'Eggs (6pc)', price: 45, category: 'Dairy' },
    { id: 7, name: 'Butter 200g', price: 60, category: 'Dairy' },
    { id: 8, name: 'Chocolate Bar', price: 50, category: 'Snacks' },
  ]


  const addItem = (product) => {
    // Handle both scanned products and regular products
    const productId = product.id || product.productId
    const existingItem = billItems.find(item => item.id === productId)
    
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem = {
        ...product,
        id: productId,
      }
      setBillItems([...billItems, { ...newItem, quantity: 1 }])
    }
    
    // Show feedback
    console.log('Item added:', product.name || 'Unknown Product')
  }

  const removeItem = (itemId) => {
    setBillItems(billItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId)
    } else {
      setBillItems(billItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ))
    }
  }

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  const total = calculateTotal()

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualProduct.name || !manualProduct.price) {
      alert('Please fill in product name and price')
      return
    }

    const newProduct = {
      id: Date.now(),
      barcode: manualProduct.barcode || 'N/A',
      name: manualProduct.name,
      price: parseFloat(manualProduct.price),
      category: 'Manual',
    }

    try {
      // Save to inventory database
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: manualProduct.name,
          price: parseFloat(manualProduct.price),
          barcode: manualProduct.barcode || 'N/A',
          category: 'Snacks',
          brand: '',
          stock: 1,
          location: 'Main Store',
          warehouse: 'Default Warehouse',
        }),
      })

      if (response.ok) {
        const savedProduct = await response.json()
        // Use the saved product ID instead of Date.now()
        newProduct.id = savedProduct.data?._id || savedProduct._id || newProduct.id
      }
    } catch (err) {
      console.error('Error saving to inventory:', err)
      // Continue anyway with local ID
    }

    // Add to bill
    addItem(newProduct)
    setManualProduct({ barcode: '', name: '', price: '' })
    setScannedBarcode(null)
    setShowManualForm(false)
  }

  // Handle when scanner detects a new barcode (not in database)
  const handleNewBarcodeScanned = (barcode) => {
    setScannedBarcode(barcode)
    setManualProduct({ barcode, name: '', price: '' })
    setShowManualForm(true)
  }

  // Show Bills view if tab is selected
  if (activeTab === 'bills') {
    return (
      <div className="billing-system">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </button>
          <button
            className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
            onClick={() => setActiveTab('bills')}
          >
            View Bills
          </button>
          <button
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
        </div>

        <Bills />
      </div>
    )
  }

  // Show Inventory view if tab is selected
  if (activeTab === 'inventory') {
    return (
      <div className="billing-system">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </button>
          <button
            className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
            onClick={() => setActiveTab('bills')}
          >
            View Bills
          </button>
          <button
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
        </div>

        <InventoryManager />
      </div>
    )
  }

  return (
    <div className="billing-system">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
        <button
          className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          View Bills
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
      </div>

      {/* Collapsible Bill Preview Sidebar */}
      <div className={`bill-preview-sidebar ${showBillPreview ? 'open' : 'closed'}`}>
        <div className="sidebar-close-btn">
          <button
            className="toggle-close-btn"
            onClick={() => setShowBillPreview(false)}
            title="Close Bill Preview"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="panel-header">
            <h2>Bill Preview</h2>
          </div>

          {/* Bill Display Component in Sidebar */}
          <BillDisplay 
            billItems={billItems}
            total={total}
            shopName={user?.shopName}
            shopAddress={user?.shopAddress}
            gstNumber={user?.gstNumber}
            customerName=""
            customerMobile=""
          />

          {/* Bill Summary Footer */}
          {billItems.length > 0 && (
            <div className="bill-actions-footer">
              <div className="bill-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (5%):</span>
                  <span>₹{(total * 0.05).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{(total * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => setBillItems([])}>
                  Clear Bill
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowPayment(true)}
                  disabled={billItems.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for sidebar */}
      {showBillPreview && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowBillPreview(false)}
        ></div>
      )}

      {/* Main content grid - responsive layout */}
      <div className="billing-container">
        {/* Left side - Product Selection with toggle button */}
        <div className="products-panel">
          {/* Toggle Bill Preview Button - Only show if there are items */}
          {billItems.length > 0 && (
            <div className="bill-preview-toggle">
              <button
                className="toggle-btn"
                onClick={() => setShowBillPreview(!showBillPreview)}
                title={showBillPreview ? 'Close Bill Preview' : 'Open Bill Preview'}
              >
                {showBillPreview ? (
                  <>
                    <EyeOff size={18} />
                    <span>Hide Bill</span>
                  </>
                ) : (
                  <>
                    <Eye size={18} />
                    <span>Show Bill</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="panel-header">
            <h2>Products</h2>
          </div>

          {/* Search and Voice Input */}
          <div className="search-section">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search or scan products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="input-buttons">
              <button 
                className="manual-add-btn"
                onClick={() => setShowManualForm(!showManualForm)}
                title="Add product manually"
              >
                <Plus size={18} />
                Manual
              </button>
              <ProductScanner 
                onProductFound={addItem} 
                onNewBarcodeScanned={handleNewBarcodeScanned}
              />
            </div>
          </div>

          {/* Manual Add Product Form */}
          {showManualForm && (
            <div className="manual-form-container">
              <form onSubmit={handleManualSubmit} className="manual-form">
                <h3>Add Product</h3>
                
                <div className="form-group">
                  <label>Barcode</label>
                  <input
                    type="text"
                    placeholder="Barcode (optional)"
                    value={manualProduct.barcode}
                    onChange={(e) => setManualProduct({ ...manualProduct, barcode: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={manualProduct.name}
                    onChange={(e) => setManualProduct({ ...manualProduct, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={manualProduct.price}
                    onChange={(e) => setManualProduct({ ...manualProduct, price: e.target.value })}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn-add-form">Add Product</button>
                  <button 
                    type="button" 
                    className="btn-cancel-form"
                    onClick={() => setShowManualForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>
                    <td className="product-price">₹{product.price}</td>
                    <td className="product-action">
                      <button
                        className="add-btn"
                        onClick={() => addItem(product)}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Check Inventory Button */}
          <div className="inventory-button-section">
            <button
              className="check-inventory-btn"
              onClick={() => setActiveTab('inventory')}
              title="View and manage inventory"
            >
              <Package size={18} />
              <span>Check Inventory</span>
            </button>
          </div>
        </div>

        {/* Center - Bill Sidebar */}
        <div className="bill-sidebar-wrapper">
          <BillSidebar
            items={billItems}
            total={total}
            onRemove={removeItem}
            onUpdateQuantity={updateQuantity}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={total * 1.05}
          billItems={billItems}
          onClose={() => setShowPayment(false)}
          onComplete={() => {
            setBillItems([])
            setShowPayment(false)
          }}
        />
      )}
    </div>
  )
}

export default BillingSystem