import React from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'

function BillSidebar({ items, total, onRemove, onUpdateQuantity }) {
  const subtotal = total
  const tax = total * 0.05
  const grandTotal = subtotal + tax

  return (
    <div className="bill-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h3>Current Bill</h3>
        <span className="item-count">{items.length} items</span>
      </div>

      {/* Bill Items List */}
      <div className="sidebar-items">
        {items.length === 0 ? (
          <div className="sidebar-empty">
            <p className="empty-icon">📄</p>
            <p className="empty-text">No items added</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item) => (
              <div key={item.id} className="sidebar-item">
                <div className="item-info">
                  <div className="item-header">
                    <span className="item-emoji">{item.image}</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                  <div className="item-details">
                    <span className="item-price">₹{item.price}</span>
                    <span className="item-qty">x{item.quantity}</span>
                  </div>
                </div>

                <div className="item-controls">
                  <div className="qty-buttons">
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      title="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      title="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => onRemove(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Footer - Summary */}
      {items.length > 0 && (
        <div className="sidebar-footer">
          <div className="summary-line">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Tax (5%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="summary-line grand-total">
            <span>Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillSidebar
