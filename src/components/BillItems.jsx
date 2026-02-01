import React from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'

function BillItems({ items, onRemove, onUpdateQuantity }) {
  if (items.length === 0) {
    return (
      <div className="bill-items empty">
        <p>No items added yet</p>
        <p className="text-small">Scan products or search to add items</p>
      </div>
    )
  }

  return (
    <div className="bill-items">
      <div className="items-header">
        <span>Item</span>
        <span>Qty</span>
        <span>Price</span>
        <span></span>
      </div>

      <div className="items-list">
        {items.map(item => (
          <div key={item.id} className="bill-item">
            <div className="item-name">
              <span className="item-emoji">{item.image}</span>
              <span>{item.name}</span>
            </div>

            <div className="quantity-control">
              <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                <Minus size={16} />
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                <Plus size={16} />
              </button>
            </div>

            <div className="item-price">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>

            <button
              className="remove-btn"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BillItems
