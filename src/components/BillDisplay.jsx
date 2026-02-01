import React, { useRef } from 'react'
import { Printer, Download, Send } from 'lucide-react'
import html2pdf from 'html2pdf.js'

function BillDisplay({ billItems, total, shopName, shopAddress, gstNumber, customerName, customerMobile }) {
  const subtotal = total
  const tax = total * 0.05
  const grandTotal = subtotal + tax
  const billRef = useRef()

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    const element = billRef.current
    const opt = {
      margin: 10,
      filename: `bill_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    }
    html2pdf().set(opt).from(element).save()
  }

  const handleSendWhatsApp = async () => {
    if (!customerMobile) {
      alert('Customer mobile number is required')
      return
    }

    try {
      const element = billRef.current
      const opt = {
        margin: 10,
        filename: `bill_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }

      // Generate PDF
      const pdf = html2pdf().set(opt).from(element)
      
      // Convert to base64
      const pdfDataUrl = await new Promise(resolve => {
        pdf.outputPdf(function(pdf) {
          const data = pdf.internal.pages[0].getContext('2d')
          resolve(data)
        })
      })

      // Format phone number
      const phoneNumber = customerMobile.startsWith('+') ? customerMobile : `+91${customerMobile}`

      // Send to backend for WhatsApp integration
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:5000/api/bills/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber,
          pdfBase64: pdfDataUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Bill sent successfully to ${phoneNumber}`)
      } else {
        alert(`❌ Error: ${data.error || 'Failed to send bill'}`)
      }
    } catch (error) {
      console.error('Error sending bill:', error)
      alert(`Error: ${error.message}`)
    }
  }

  if (billItems.length === 0) {
    return (
      <div className="bill-display empty-bill">
        <div className="bill-empty-state">
          <p>📄 No items in bill</p>
          <p className="text-small">Add products to generate bill</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bill-display">
      {/* Action Buttons */}
      <div className="bill-actions">
        <button className="action-btn print-btn" onClick={handlePrint} title="Print Bill">
          <Printer size={18} />
          Print
        </button>
        <button className="action-btn download-btn" onClick={handleDownloadPDF} title="Download as PDF">
          <Download size={18} />
          Download PDF
        </button>
        <button className="action-btn whatsapp-btn" onClick={handleSendWhatsApp} title="Send via WhatsApp">
          <Send size={18} />
          Send WhatsApp
        </button>
      </div>

      {/* Professional Invoice */}
      <div className="bill-container" ref={billRef}>
        {/* Header - Shop Name Centered and Bold */}
        <div className="invoice-header">
          <h1 className="invoice-title">{shopName || 'My Shop'}</h1>
          <p className="invoice-subtitle">TAX INVOICE</p>
        </div>

        {/* Shop Details */}
        <div className="shop-details-section">
          <div className="shop-details">
            <p className="detail-item"><strong>Address:</strong> {shopAddress || 'Address'}</p>
            {gstNumber && <p className="detail-item"><strong>GST Number:</strong> {gstNumber}</p>}
            <p className="detail-item"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
          <div className="bill-details-right">
            <p className="detail-item"><strong>Invoice #:</strong> {Math.floor(Math.random() * 100000)}</p>
            <p className="detail-item"><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="invoice-divider"></div>

        {/* Customer Information */}
        {(customerName || customerMobile) && (
          <div className="customer-section">
            <h3 className="section-title">Customer Details</h3>
            <div className="customer-details">
              {customerName && <p><strong>Name:</strong> {customerName}</p>}
              {customerMobile && <p><strong>Mobile:</strong> {customerMobile}</p>}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="invoice-divider"></div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr className="table-header">
              <th className="col-item">Item Description</th>
              <th className="col-qty">Qty</th>
              <th className="col-rate">Rate</th>
              <th className="col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item, index) => (
              <tr key={index} className="table-row">
                <td className="col-item">{item.name}</td>
                <td className="col-qty text-center">{item.quantity}</td>
                <td className="col-rate text-right">₹{item.price.toFixed(2)}</td>
                <td className="col-amount text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Divider */}
        <div className="invoice-divider"></div>

        {/* Totals Section */}
        <div className="totals-section">
          <div className="totals-container">
            <div className="total-row">
              <span className="total-label">Subtotal:</span>
              <span className="total-value">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Tax (5%):</span>
              <span className="total-value">₹{tax.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span className="total-label">Grand Total:</span>
              <span className="total-value">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="invoice-divider"></div>

        {/* Footer */}
        <div className="invoice-footer">
          <p className="footer-message">Thank You for Your Purchase!</p>
          <p className="footer-note">Please retain this invoice for warranty & returns</p>
          <p className="footer-note">Terms & Conditions apply</p>
        </div>
      </div>
    </div>
  )
}

export default BillDisplay
