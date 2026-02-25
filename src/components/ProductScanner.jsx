import React, { useEffect, useRef, useState } from "react"
import { Scan, X, Plus, Loader, AlertCircle } from "lucide-react"
import { BrowserMultiFormatReader } from "@zxing/browser"

const API_BASE =
  `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000"

function ProductScanner({ onProductFound, onNewBarcodeScanned, mode = "billing" }) {
  const videoRef = useRef(null)
  const scanningRef = useRef(false)
  const controlsRef = useRef(null)
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

  console.log("Scanner effect start")

  // ⭐ kill previous instance FIRST
  if (controlsRef.current) {
    controlsRef.current.stop()
    controlsRef.current = null
  }

  if (videoRef.current?.srcObject) {
    videoRef.current.srcObject
      .getTracks()
      .forEach(t => t.stop())

    videoRef.current.srcObject = null
  }

  if (!scanning) return

    setScannerLoading(true)
    setError(null)
    scanningRef.current = true

  const initScanner = async () => {
  try {
    const devices =
      await BrowserMultiFormatReader.listVideoInputDevices()

    const device =
      devices.find(d =>
        /back|rear|environment/i.test(d.label)
      ) || devices[0]

    // ✅ Manual camera control
    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: device.deviceId },
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: "continuous"
        }
      })

    streamRef.current = stream
    videoRef.current.srcObject = stream

    const track = stream.getVideoTracks()[0]
    const caps = track.getCapabilities()

    // ✅ FORCE AUTOFOCUS
    if (caps.focusMode) {
      await track.applyConstraints({
        advanced: [{ focusMode: "continuous" }]
      })
    }

    controlsRef.current = null
    const codeReader = new BrowserMultiFormatReader()

    codeReader.decodeFromVideoElement(
  videoRef.current,
  (result, err, controls) => {

    controlsRef.current = controls

    if (!scanningRef.current) {
      controls.stop()
      return
    }

    if (result?.getText()) {

  scanningRef.current = false
  controls.stop()

  // ⭐ immediately release camera
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  handleAutoSearch(
    result.getText(),
    result.getBarcodeFormat()
  )
  }
  }
)

  } catch (err) {
    console.error(err)
  }
}

console.log("Calling initScanner")
initScanner()

 return () => {
  console.log("Cleanup scanner")

  scanningRef.current = false

  // ✅ stop ZXing decoding
  if (controlsRef.current) {
    controlsRef.current.stop()
    controlsRef.current = null
  }

  // ✅ stop camera tracks
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track =>
      track.stop()
    )
    streamRef.current = null
  }

  // ✅ fully release video element
  if (videoRef.current) {
    videoRef.current.pause()
    videoRef.current.srcObject = null
    videoRef.current.load()   // ⭐ IMPORTANT
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
  console.log("STOP SCAN")

  scanningRef.current = false

  // stop decoder
  if (controlsRef.current) {
    controlsRef.current.stop()
    controlsRef.current = null
  }

  // stop camera
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track =>
      track.stop()
    )
    streamRef.current = null
  }

  // detach video
  if (videoRef.current) {
    videoRef.current.pause()
    videoRef.current.srcObject = null
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
                objectFit: "cover",
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