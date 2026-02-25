import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}` || 'http://localhost:5000'

function PaymentModal({ total, billItems = [], onClose, onComplete }) {
  const { token, user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [discount, setDiscount] = useState('0')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Customer Details
  const [customerName, setCustomerName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')

  const discountAmount = (parseFloat(discount) || 0)
  const finalTotal = Math.max(0, total - discountAmount)
  const change = amountReceived ? (parseFloat(amountReceived) - finalTotal).toFixed(2) : 0

  const handlePayment = async () => {
    if (!amountReceived || parseFloat(amountReceived) < finalTotal) {
      alert('Insufficient amount')
      return
    }

    setIsProcessing(true)
    try {
      // Create bill in database
      const billData = {
        items: billItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        subtotal: total - (total * 0.05),
        tax: total * 0.05,
        taxPercentage: 5,
        discount: discountAmount,
        total: finalTotal,
        paymentMethod,
        amountReceived: parseFloat(amountReceived),
        change: parseFloat(change),
        // Shop Details
        shopName: user?.shopName || '',
        shopAddress: user?.shopAddress || '',
        shopPhone: user?.phone || '',
        gstNumber: user?.gstNumber || '',
        // Customer Details
        customerName: customerName || 'Walk-in Customer',
        customerMobile: customerMobile || 'N/A',
      }

      const billResponse = await fetch(`${API_BASE_URL}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(billData),
      })

      if (!billResponse.ok) {
        const errorData = await billResponse.json()
        throw new Error(errorData.error || 'Failed to create bill')
      }

      // Deduct inventory for all bill items
      if (billItems.length > 0) {
        const response = await fetch(`${API_BASE_URL}/api/inventory/deduct-bill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billItems }),
        })

        const data = await response.json()

        if (!data.success) {
          console.error('Inventory deduction errors:', data.errors)
          if (data.errors && data.errors.length > 0) {
            const errorMsg = data.errors.map(e => `${e.product}: ${e.error}`).join('\n')
            alert(`Payment successful but some inventory items could not be updated:\n\n${errorMsg}`)
          }
        }
      }

      alert('Payment successful! Bill created.')
      onComplete()
    } catch (error) {
      console.error('Payment error:', error)
      alert(`Payment error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <h2>Payment & Customer Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Customer Details Section */}
          <div className="customer-details-section">
            <h3>Customer Information</h3>
            <div className="form-group">
              <label>Customer Name:</label>
              <input
                type="text"
                placeholder="Enter customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Mobile Number:</label>
              <input
                type="tel"
                placeholder="Enter mobile number (optional)"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
              />
            </div>
            
          </div>

          {/* Amount Display */}
          <div className="amount-section">
            <div className="amount-box">
              <span>Total Amount:</span>
              <span className="amount">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-method">
            <label>Payment Method:</label>
            <div className="method-options">
              {['Cash', 'Card', 'UPI', 'Check'].map(method => (
                <label key={method} className="method-option">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          {paymentMethod === 'Cash' && (
            <div className="amount-input-section">
              <label>Amount Received:</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                autoFocus
              />
              {amountReceived && (
                <div className="change-box">
                  <span>Change:</span>
                  <span className={change >= 0 ? 'positive' : 'negative'}>
                    ₹{change}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Discount Option */}
          <div className="discount-section">
            <label>Discount (₹):</label>
            <input 
              type="number" 
              placeholder="0" 
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handlePayment}
            disabled={!amountReceived || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
