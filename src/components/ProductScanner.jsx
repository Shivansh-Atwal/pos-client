import React, { useEffect, useRef, useState } from "react"
import { Scan, X, Plus, Loader, AlertCircle } from "lucide-react"
import { BrowserMultiFormatReader } from "@zxing/browser"

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000"

function ProductScanner({ onProductFound, onNewBarcodeScanned, mode = "billing" }) {
  const videoRef = useRef(null)
  const scanningRef = useRef(false)
  const controlsRef = useRef(null)

  const [scanning, setScanning] = useState(false)
  const [scannerLoading, setScannerLoading] = useState(false)
  const [apiLoading, setApiLoading] = useState(false)
  const [detectedBarcode, setDetectedBarcode] = useState(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Others",
    brand: "",
    barcode: "",
    quantity: "1",
    location: "Main Store",
    warehouse: "Default",
  })

  // ===============================
  // INIT SCANNER
  // ===============================
  useEffect(() => {
    if (!scanning) return

    setScannerLoading(true)
    setError(null)
    scanningRef.current = true

    const initScanner = async () => {
      try {
        const codeReader = new BrowserMultiFormatReader()
        const videoInputDevices =
          await BrowserMultiFormatReader.listVideoInputDevices()

        if (videoInputDevices.length === 0) {
          throw new Error("No camera devices found")
        }

        console.log("Starting barcode scanning with ZXing...")
        codeReader
          .decodeFromVideoDevice(
            videoInputDevices[0].deviceId,
            videoRef.current,
            (result, err, controls) => {
              controlsRef.current = controls

              if (!scanningRef.current) {
                controls.stop()
                return
              }

              if (result && result.getText()) {
                const barcode = result.getText()
                console.log("✓ Barcode detected:", barcode)

                setDetectedBarcode({
                  barcode,
                  format: result.getBarcodeFormat(),
                })

                setFormData((prev) => ({
                  ...prev,
                  barcode,
                }))

                scanningRef.current = false
                controls.stop()
                
                // Auto-search product after barcode detected
                setTimeout(() => {
                  handleAutoSearch(barcode, result.getBarcodeFormat())
                }, 100)
              }
            }
          )
          .then(() => {
            setScannerLoading(false)
          })
          .catch((err) => {
            console.error("Camera/Scanning error:", err)
            setError(
              err.message.includes("Permission denied")
                ? "Camera access denied. Please allow camera permissions."
                : `Error: ${err.message}`
            )
            setScannerLoading(false)
          })
      } catch (err) {
        console.error("Scanner initialization error:", err)
        setError(err.message || "Failed to initialize scanner")
        setScannerLoading(false)
      }
    }

    initScanner()

    return () => {
      scanningRef.current = false
      if (controlsRef.current) {
        controlsRef.current.stop()
      }
    }
  }, [scanning])

  // ===============================
  // HANDLERS
  // ===============================
  const startScan = () => {
    resetState()
    setScanning(true)
  }

  const stopScan = () => {
    scanningRef.current = false
    if (controlsRef.current) {
      controlsRef.current.stop()
    }
    setScanning(false)
  }

  const resetState = () => {
    setDetectedBarcode(null)
    setShowManualForm(false)
    setError(null)
    setFormData({
      name: "",
      price: "",
      category: "Others",
      brand: "",
      barcode: "",
      quantity: "1",
      location: "Main Store",
      warehouse: "Default",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  // ===============================
  // AUTO SEARCH & ADD PRODUCT
  // ===============================
  const handleAutoSearch = async (barcode, format) => {
    setApiLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_BASE}/api/products/barcode/${barcode}`
      )
      const data = await res.json()

      if (data.success && data.data) {
        // Auto-add found product to bill
        onProductFound({
          id: data.data._id,
          name: data.data.name,
          price: data.data.price,
          category: data.data.category,
          brand: data.data.brand || "",
          barcode: data.data.barcode,
          source: "barcode",
        })
        resetState()
        setScanning(false)
      } else {
        // Product not found, pass barcode to parent component
        if (onNewBarcodeScanned) {
          onNewBarcodeScanned(barcode)
        } else {
          // Fallback to showing manual form in scanner
          setDetectedBarcode({ barcode, format })
          setShowManualForm(true)
        }
        setScanning(false)
      }
    } catch (err) {
      console.error("Search error:", err)
      // Pass barcode to parent component on error
      if (onNewBarcodeScanned) {
        onNewBarcodeScanned(detectedBarcode?.barcode || "")
      } else {
        // Fallback to showing manual form in scanner
        setDetectedBarcode({ barcode, format })
        setShowManualForm(true)
      }
      setScanning(false)
    } finally {
      setApiLoading(false)
    }
  }

  // ===============================
  // SEARCH PRODUCT (DEPRECATED - use handleAutoSearch instead)
  // ===============================
  const searchProduct = async () => {
    if (!detectedBarcode?.barcode){
      alert("No barcode detected")
      return
    }
    // Call the auto search handler
    await handleAutoSearch(detectedBarcode.barcode, detectedBarcode.format)
  }

  // ===============================
  // ADD PRODUCT (register to inventory and add to bill)\n  // ===============================
  const addProduct = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.barcode) {
      alert("Required fields missing")
      return
    }

    setApiLoading(true)
    try {
      // Register product to inventory
      const inventoryRes = await fetch(`${API_BASE}/api/inventory/register-barcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: formData.barcode,
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
          brand: formData.brand || "",
          quantity: parseInt(formData.quantity) || 1,
          minStock: 10,
          location: formData.location,
          warehouse: formData.warehouse,
        }),
      })

      const inventoryData = await inventoryRes.json()

      if (inventoryData.success) {
        const productData = inventoryData.data.product
        // Auto-add new product to bill
        onProductFound({
          id: productData._id,
          name: productData.name,
          price: productData.price,
          category: productData.category,
          brand: productData.brand || "",
          barcode: productData.barcode,
          source: "registered",
        })
        resetState()
      } else {
        alert(inventoryData.error || "Failed to register product")
      }
    } catch (err) {
      console.error("Error adding product:", err)
      alert("Failed to add product")
    } finally {
      setApiLoading(false)
    }
  }

  // ===============================
  // UI RENDERING
  // ===============================
  if (!scanning && !detectedBarcode && !showManualForm) {
    return (
      <div className="scanner-container">
        <div className="scanner-buttons">
          <button onClick={startScan} title="Scan barcode with camera" className="scanner-btn">
            <Scan size={20} />
            <span>Scan</span>
          </button>
          {/* <button onClick={() => setShowManualForm(true)} title="Enter product manually" className="scanner-btn">
            <Plus size={20} />
            <span>Manual</span>
          </button> */}
        </div>
      </div>
    )
  }

  if (scanning) {
    return (
      <div className="scanner-modal">
        <div className="scanner-overlay">
          <div className="scanner-header">
            <h3>Scan Barcode</h3>
            <button className="close-btn" onClick={stopScan}>
              <X size={20} />
            </button>
          </div>

          <div className="scanner-video-container">
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
              }}
              autoPlay
              muted
              playsInline
            />

            {scannerLoading && (
              <div className="loading-state">
                <Loader className="spinner" />
                <p>Initializing camera...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <AlertCircle size={24} />
                <p>{error}</p>
              </div>
            )}

            {!scannerLoading && !error && (
              <div className="scanning-hint">
                <p>Point camera at barcode</p>
                <p className="hint-text">Position barcode in center of frame</p>
              </div>
            )}
          </div>

          <button className="stop-btn" onClick={stopScan}>
            Stop Scanning
          </button>
        </div>
      </div>
    )
  }

  if (detectedBarcode && !showManualForm) {
    return (
      <div className="scanner-modal">
        <div className="scanner-overlay">
          <h3>✓ Barcode Detected</h3>
          <div className="barcode-display">
            <p className="barcode-value">{detectedBarcode.barcode}</p>
            <p className="barcode-format">{detectedBarcode.format || "Unknown"}</p>
          </div>

          <div className="button-group">
            <button onClick={searchProduct} disabled={apiLoading} className="search-btn">
              {apiLoading ? "Searching..." : "Search Product"}
            </button>
            <button onClick={() => setScanning(true)} className="rescan-btn">
              Scan Again
            </button>
            <button onClick={() => setShowManualForm(true)} className="manual-btn">
              Manual Entry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default ProductScanner
