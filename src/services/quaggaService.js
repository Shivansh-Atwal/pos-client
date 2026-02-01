import Quagga from 'quagga'

let quaggaInitialized = false
let lastDetectedCode = null
let detectionCount = 0
let detectionCallback = null

/**
 * Initialize Quagga barcode scanner
 * @param {HTMLElement} container - Container element for video stream
 * @param {Function} onDetected - Callback when barcode is detected
 * @param {Function} onError - Callback for errors
 * @returns {Promise<void>}
 */
export function initQuagga(container, onDetected, onError) {
  return new Promise((resolve, reject) => {
    try {
      // Check if container exists and has proper ID
      if (!container || container.id !== 'scanner-container') {
        const err = new Error('Invalid scanner container')
        onError(err)
        reject(err)
        return
      }

      // Prevent double initialization
      if (quaggaInitialized) {
        console.log('ℹ Quagga already initialized')
        resolve()
        return
      }

      // Reset detection counters
      lastDetectedCode = null
      detectionCount = 0

      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: container,
            constraints: {
              width: { ideal: 1280 },
              height: { ideal: 960 },
              facingMode: 'environment',
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: 4,
          frequency: 30,
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
              'code_39_vin_reader',
              'code_93_reader',
              'codabar_reader',
              'upc_reader',
              'upc_e_reader',
              'i2of5_reader',
              'industrial_code_reader',
            ],
            multiple: false,
          },
        },
        (err) => {
          if (err) {
            console.error('❌ Quagga init error:', err.message)
            onError(err)
            reject(err)
            return
          }

          console.log('✓ Quagga initialized successfully')
          quaggaInitialized = true

          try {
            // Optimize Canvas2D for better performance
            const canvas = container.querySelector('canvas')
            if (canvas) {
              const ctx = canvas.getContext('2d', { willReadFrequently: true })
              console.log('✓ Canvas context optimized')
            }
          } catch (e) {
            console.warn('⚠ Could not optimize canvas:', e.message)
          }

          // Create detection handler with duplicate prevention
          detectionCallback = (result) => {
            detectionCount++

            if (!result || !result.codeResult) {
              return
            }

            const code = result.codeResult.code
            const confidence = result.codeResult.confidence || 0
            const format = result.codeResult.format || 'unknown'

            // Log all detection attempts
            console.log(`🔍 Detection #${detectionCount}: "${code}" (${format}) - ${(confidence * 100).toFixed(1)}% confidence`)

            // Only process if confidence is adequate or code is new
            if (confidence < 0.3) {
              console.log(`  ↳ Low confidence (${(confidence * 100).toFixed(1)}%), skipping`)
              return
            }

            // Prevent duplicate detections
            if (lastDetectedCode === code) {
              console.log(`  ↳ Duplicate barcode, skipping`)
              return
            }

            // Mark as detected and trigger callback
            console.log(`✓ BARCODE DETECTED: "${code}"`)
            lastDetectedCode = code

            // Small delay to debounce
            setTimeout(() => {
              onDetected(result)
            }, 50)
          }

          // Register the handler
          Quagga.onDetected(detectionCallback)

          // Start scanning
          Quagga.start()
          console.log('🎥 Scanner started and ready for barcodes...')

          resolve()
        }
      )
    } catch (error) {
      console.error('❌ Fatal error initializing Quagga:', error.message)
      onError(error)
      reject(error)
    }
  })
}

/**
 * Stop Quagga scanner
 */
export function stopQuagga() {
  try {
    if (!quaggaInitialized) {
      console.log('ℹ Scanner not initialized, nothing to stop')
      return
    }

    // Deregister handlers
    if (detectionCallback) {
      Quagga.offDetected(detectionCallback)
      detectionCallback = null
    }

    // Stop the scanner
    Quagga.stop()
    quaggaInitialized = false
    lastDetectedCode = null
    detectionCount = 0

    console.log('⏹ Scanner stopped')
  } catch (error) {
    console.error('⚠ Error stopping Quagga:', error.message)
    quaggaInitialized = false
  }
}

/**
 * Process detected barcode
 * @param {Object} result - Quagga detection result
 * @returns {Object} Processed barcode data
 */
export function processBarcodeResult(result) {
  if (!result?.codeResult) {
    return null
  }

  const barcode = result.codeResult.code
  const format = result.codeResult.format || 'unknown'
  const confidence = result.codeResult.confidence || 0

  return {
    barcode,
    format,
    confidence,
  }
}
