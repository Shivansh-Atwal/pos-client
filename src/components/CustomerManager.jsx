import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import '../styles/CustomerManager.css'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = 'http://localhost:5000'

function CustomerManager() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    gstNumber: '',
    notes: '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCustomers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    if (searchTerm) {
      const filtered = customers.filter(
        customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.mobileNumber.includes(searchTerm)
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      mobileNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      gstNumber: '',
      notes: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEditCustomer = (customer) => {
    setFormData(customer)
    setEditingId(customer._id)
    setShowForm(true)
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.mobileNumber) {
      alert('Name and mobile number are required')
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const url = editingId
        ? `${API_BASE_URL}/api/customers/${editingId}`
        : `${API_BASE_URL}/api/customers`
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        fetchCustomers()
        resetForm()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Failed to save customer')
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        alert('Customer deleted successfully')
        fetchCustomers()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer')
    }
  }

  return (
    <div className="customer-manager">
      {/* Header */}
      <div className="customer-header">
        <div>
          <h1 className="customer-title">Customers</h1>
          <p className="customer-subtitle">Manage customer details for WhatsApp messaging</p>
        </div>
        <button className="btn-add-customer" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="customer-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="customer-form-container">
          <div className="customer-form">
            <h2>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Customer name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="10 digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="GST number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Zip code"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update Customer' : 'Add Customer'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customers List */}
      <div className="customers-list">
        {loading ? (
          <div className="loading-state">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <p>No customers found</p>
            <p className="text-small">Add your first customer to enable WhatsApp messaging</p>
          </div>
        ) : (
          <div className="customers-grid">
            {filteredCustomers.map(customer => (
              <div key={customer._id} className="customer-card">
                <div className="card-header">
                  <h3 className="customer-name">{customer.name}</h3>
                  <div className="card-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEditCustomer(customer)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDeleteCustomer(customer._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="detail-row">
                    <span className="label">Mobile:</span>
                    <span className="value">{customer.mobileNumber}</span>
                  </div>
                  {customer.email && (
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="detail-row">
                      <span className="label">Address:</span>
                      <span className="value">{customer.address}</span>
                    </div>
                  )}
                  {customer.gstNumber && (
                    <div className="detail-row">
                      <span className="label">GST:</span>
                      <span className="value">{customer.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerManager
