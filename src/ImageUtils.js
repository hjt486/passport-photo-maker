import pica from 'pica'
export const resizeAndCompressImage = (imageData, targetWidth, targetHeight, maxSizeKB) => {
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
              if (blob.size / 1024 <= maxSizeKB || quality <= 0) {
                resolve(blob)
              } else {
                // Reduce quality and try again
                quality -= 0.1 // Adjust the step size as needed
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
