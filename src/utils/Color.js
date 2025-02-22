const Color = (canvas, color) => {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Brightness
    data[i] = data[i] + (color.brightness * 2.55)     // Red
    data[i + 1] = data[i + 1] + (color.brightness * 2.55) // Green
    data[i + 2] = data[i + 2] + (color.brightness * 2.55) // Blue

    // Contrast
    const factor = (259 * (color.contrast + 255)) / (255 * (259 - color.contrast))
    data[i] = factor * (data[i] - 128) + 128
    data[i + 1] = factor * (data[i + 1] - 128) + 128
    data[i + 2] = factor * (data[i + 2] - 128) + 128

    // Saturation
    const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2]
    const satFactor = 1 + (color.saturation / 100)
    data[i] = gray + satFactor * (data[i] - gray)
    data[i + 1] = gray + satFactor * (data[i + 1] - gray)
    data[i + 2] = gray + satFactor * (data[i + 2] - gray)

    // Warmth
    data[i] = data[i] + (color.warmth * 2.55)     // Increase red
    data[i + 2] = data[i + 2] - (color.warmth * 2.55) // Decrease blue
  }

  ctx.putImageData(imageData, 0, 0)
}

export default Color