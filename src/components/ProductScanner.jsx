import React, { useEffect, useRef, useState } from "react"
import { Scan, X, Plus, Loader, AlertCircle } from "lucide-react"
import { BrowserMultiFormatReader } from "@zxing/browser"

const API_BASE =
  `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000"

function ProductScanner({ onProductFound, onNewBarcodeScanned, mode = "billing" }) {
  const videoRef = useRef(null)
  const scanningRef = useRef(false)
  const controlsRef = useRef(null)
  const readerRef = useRef(null)
  const streamRef = useRef(null)

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
  // INIT SCANNER (BACK CAMERA LOGIC)
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

        if (result?.getText()) {
          const barcode = result.getText()

          console.log("✓ Barcode detected:", barcode)

          setDetectedBarcode({
            barcode,
            format: result.getBarcodeFormat(),
          })

          setFormData(prev => ({
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
    controlsRef.current = null
  }

  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track =>
      track.stop()
    )
    streamRef.current = null
  }

  if (videoRef.current) {
    videoRef.current.pause()
    videoRef.current.srcObject = null
  }

  readerRef.current = null
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
  console.log("FULL CAMERA STOP")

  scanningRef.current = false

  // ✅ Stop ZXing decoder
  if (controlsRef.current) {
    controlsRef.current.stop()
    controlsRef.current = null
  }

  // ✅ Stop ALL media tracks
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => {
      track.stop()
    })
    streamRef.current = null
  }

  // ✅ Detach video completely
  if (videoRef.current) {
    videoRef.current.pause()
    videoRef.current.srcObject = null
  }

  // ✅ Destroy ZXing instance
  readerRef.current = null

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
  // AUTO SEARCH
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
        if (onNewBarcodeScanned) {
          onNewBarcodeScanned(barcode)
        } else {
          setDetectedBarcode({ barcode, format })
          setShowManualForm(true)
        }
        setScanning(false)
      }
    } catch (err) {
      console.error("Search error:", err)
      if (onNewBarcodeScanned) {
        onNewBarcodeScanned(barcode)
      } else {
        setDetectedBarcode({ barcode, format })
        setShowManualForm(true)
      }
      setScanning(false)
    } finally {
      setApiLoading(false)
    }
  }

  // ===============================
  // UI
  // ===============================
  if (!scanning && !detectedBarcode && !showManualForm) {
    return (
      <div className="scanner-container">
        <div className="scanner-buttons">
          <button onClick={startScan} className="scanner-btn">
            <Scan size={20} />
            <span>Scan</span>
          </button>
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
            <button style={{ background: "white", color: "black", border: "1px solid #ccc" }} onClick={stopScan}>
              <X size={20} />
            </button>
          </div>

          <div className="scanner-video-container">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000",
              }}
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

          <button className="stop-btn" style={{ background: "white", color: "black", border: "1px solid #ccc" }} onClick={stopScan}>
            Stop Scanning
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default ProductScanner