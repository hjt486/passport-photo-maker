import pica from 'pica'
const resizeAndCompressImage = (imageData, targetWidth, targetHeight, maxSizeKB) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = imageData

    img.onload = async () => {
      // Create an off-screen canvas for Pica to work with
      const offScreenCanvas = document.createElement('canvas')
      offScreenCanvas.width = targetWidth
      offScreenCanvas.height = targetHeight

      // Use Pica to resize the image
      try {
        await pica().resize(img, offScreenCanvas)

        // Create another canvas to apply compression
        const compressCanvas = document.createElement('canvas')
        compressCanvas.width = targetWidth
        compressCanvas.height = targetHeight
        const ctx = compressCanvas.getContext('2d')

        // Draw white background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, targetWidth, targetHeight)

        // Draw the resized image on top of the white background
        ctx.drawImage(offScreenCanvas, 0, 0, targetWidth, targetHeight)

        // Initialize quality
        let quality = 1.0

        // Function to compress the image
        const compressImage = () => {
          compressCanvas.toBlob(
            (blob) => {
              if (blob.size / 1024 <= maxSizeKB - 2 || quality <= 0) {
                resolve(blob)
              } else {
                // Reduce quality and try again
                quality -= 0.01 // Adjust the step size as needed
                compressCanvas.toBlob(compressImage, 'image/jpeg', quality)
              }
            },
            'image/jpeg',
            quality
          )
        }

        // Start compression with the initial quality
        compressImage()
      } catch (error) {
        console.error('Error processing image:', error)
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image.'))
    }
  })
}

export const generateSingle = (croppedImage, editorRef, exportPhoto) => {
  return new Promise((resolve, reject) => {
    if (editorRef && editorRef.current && croppedImage) {
      // Get the canvas from AvatarEditor
      const canvas = editorRef.current.getImage()
      const imageDataUrl = canvas.toDataURL('image/png')

      // Now use resizeAndCompressImage
      resizeAndCompressImage(imageDataUrl, exportPhoto.width, exportPhoto.height, exportPhoto.size)
        .then((resizedBlob) => {
          const url = URL.createObjectURL(resizedBlob)
          resolve(url)
        })
        .catch((error) => {
          console.error('Error resizing and compressing image:', error)
          reject(error)
        })
    } else {
      reject(new Error("Missing required parameters"))
    }
  })
}

export const handleSaveSingle = (imageSrc) => {
  if (!imageSrc) {
    console.error('No image source provided for download.')
    return
  }
  const a = document.createElement('a')
  a.href = imageSrc
  a.download = 'resized-image.jpeg'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}


export const generate4x6 = (MM2INCH, croppedImage, exportPhoto) => {
  return new Promise((resolve, reject) => {
    if (croppedImage && exportPhoto) {
      // Define margins and spacing
      const outerMarginMM = 5 // 10 mm margin around the canvas
      const marginMM = 0.2 // 1 mm margin around each photo
      const spacingMM = 2 // 5 mm spacing between photos

      const outerMargin = outerMarginMM / MM2INCH * exportPhoto.dpi
      const margin = marginMM / MM2INCH * exportPhoto.dpi
      const spacing = spacingMM / MM2INCH * exportPhoto.dpi

      // Calculate the single photo dimensions with margin
      const photoWidth = exportPhoto.width_mm / MM2INCH * exportPhoto.dpi
      const photoHeight = exportPhoto.height_mm / MM2INCH * exportPhoto.dpi
      const photoWidthWithMargin = photoWidth + 2 * margin
      const photoHeightWithMargin = photoHeight + 2 * margin

      // Calculate potential layouts for portrait and landscape
      const portrait = calculateLayout(4 * exportPhoto.dpi - 2 * outerMargin, 6 * exportPhoto.dpi - 2 * outerMargin, photoWidthWithMargin, photoHeightWithMargin, spacing)
      const landscape = calculateLayout(6 * exportPhoto.dpi - 2 * outerMargin, 4 * exportPhoto.dpi - 2 * outerMargin, photoWidthWithMargin, photoHeightWithMargin, spacing)

      // Determine best orientation
      const usePortrait = (portrait.count >= landscape.count)

      // Set canvas dimensions based on best orientation
      const canvasWidth = usePortrait ? 4 * exportPhoto.dpi : 6 * exportPhoto.dpi
      const canvasHeight = usePortrait ? 6 * exportPhoto.dpi : 4 * exportPhoto.dpi

      // Create a canvas element to draw the photos
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Load the image and draw it on the canvas
      const img = new Image()
      img.src = croppedImage

      img.onload = () => {
        // Calculate the starting positions
        const layout = usePortrait ? portrait : landscape
        const startX = outerMargin + (canvasWidth - 2 * outerMargin - (layout.columns * photoWidthWithMargin + (layout.columns - 1) * spacing)) / 2
        const startY = outerMargin + (canvasHeight - 2 * outerMargin - (layout.rows * photoHeightWithMargin + (layout.rows - 1) * spacing)) / 2

        // Draw the photos with margin and dotted line
        for (let i = 0; i < layout.columns; i++) {
          for (let j = 0; j < layout.rows; j++) {
            const x = startX + i * (photoWidthWithMargin + spacing)
            const y = startY + j * (photoHeightWithMargin + spacing)
            // Draw the photo
            ctx.drawImage(img, x + margin, y + margin, photoWidth, photoHeight)
            // Draw the dotted line for cutting
            drawDottedLine(ctx, x, y, photoWidthWithMargin, photoHeightWithMargin)
          }
        }

        resolve(canvas.toDataURL())
      }

      img.onerror = () => {
        reject(new Error('Failed to load the image.'))
      }
    } else {
      reject(new Error('Missing required parameters for image generation.'))
    }
  })
}

// Rest of the helper functions remain the same


// Helper function to calculate the layout
const calculateLayout = (canvasWidth, canvasHeight, photoWidth, photoHeight, spacing) => {
  const columns = Math.floor((canvasWidth + spacing) / (photoWidth + spacing))
  const rows = Math.floor((canvasHeight + spacing) / (photoHeight + spacing))
  return {
    count: columns * rows,
    columns: columns,
    rows: rows
  }
}

// Helper function to draw dotted lines
const drawDottedLine = (ctx, x, y, width, height) => {
  const dashLength = 3
  const dashSpace = 3
  ctx.beginPath()
  ctx.setLineDash([dashLength, dashSpace])
  ctx.strokeStyle = 'lightgrey'
  ctx.rect(x, y, width, height)
  ctx.stroke()
  ctx.setLineDash([])
}


export const handleSave4x6 = (fourBySixImage) => {
  const a = document.createElement('a')
  a.href = fourBySixImage
  a.download = '4x6-image.jpeg'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}