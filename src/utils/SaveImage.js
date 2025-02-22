export const generateSingle = async (croppedImage, exportPhoto) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = exportPhoto.width
      canvas.height = exportPhoto.height
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, exportPhoto.width, exportPhoto.height)
      resolve(canvas.toDataURL('image/jpeg', exportPhoto.size / 100))
    }
    img.onerror = reject
    img.src = croppedImage
  })
}

export const generate4x6 = async (croppedImage, exportPhoto) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const PRINT_WIDTH = 1800
      const PRINT_HEIGHT = 1200
      canvas.width = PRINT_WIDTH
      canvas.height = PRINT_HEIGHT
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const photoWidth = exportPhoto.width
      const photoHeight = exportPhoto.height
      const margin = 20
      const rows = Math.floor(PRINT_HEIGHT / (photoHeight + margin))
      const cols = Math.floor(PRINT_WIDTH / (photoWidth + margin))

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * (photoWidth + margin) + margin
          const y = i * (photoHeight + margin) + margin
          ctx.drawImage(img, x, y, photoWidth, photoHeight)
        }
      }

      resolve(canvas.toDataURL('image/jpeg', exportPhoto.size / 100))
    }
    img.onerror = reject
    img.src = croppedImage
  })
}

export const handleSaveSingle = (imageSrc) => {
  const link = document.createElement('a')
  link.download = 'passport_photo_single.jpg'
  link.href = imageSrc
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const handleSave4x6 = (imageSrc) => {
  const link = document.createElement('a')
  link.download = 'passport_photo_4x6.jpg'
  link.href = imageSrc
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}