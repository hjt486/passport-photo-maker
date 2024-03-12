// Utility function to convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  var max = Math.max(r, g, b), min = Math.min(r, g, b)
  var h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
      default: break
    }
    h /= 6
  }

  return [h, s, l]
}

// Utility function to convert HSL back to RGB
function hslToRgb(h, s, l) {
  var r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s
    var p = 2 * l - q
    h *= 360 // assuming h is in [0,1] and needs to be scaled to [0,360]
    h /= 360 // convert h back to [0,1]
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [r * 255, g * 255, b * 255]
}

  function adjustContrast(data, contrast){  //input range [-100..100]
    var d = data;
    contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
    var intercept = 128 * (1 - contrast);
    for(var i=0;i<d.length;i+=4){   //r,g,b,a
        d[i] = d[i]*contrast + intercept;
        d[i+1] = d[i+1]*contrast + intercept;
        d[i+2] = d[i+2]*contrast + intercept;
    }
    return data;
}

function adjustImage(canvas, adjustments) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply saturation
    if (adjustments.saturation !== 0) {
      const hsl = rgbToHsl(r, g, b);
      hsl[1] *= (1 + adjustments.saturation / 100);
      hsl[1] = Math.max(0, Math.min(1, hsl[1])); // Ensure saturation stays within the range
      [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]);
    }

    // Apply brightness
    r += 255 * (adjustments.brightness / 100);
    g += 255 * (adjustments.brightness / 100);
    b += 255 * (adjustments.brightness / 100);

    // Apply warmth
    const warmthAdjustment = adjustments.warmth * 2; // Scale down the adjustment impact
    if (adjustments.warmth !== 0) {
      r = adjustments.warmth > 0 ? Math.min(255, r + warmthAdjustment) : Math.max(0, r - Math.abs(warmthAdjustment));
      b = adjustments.warmth > 0 ? Math.max(0, b - warmthAdjustment) : Math.min(255, b + Math.abs(warmthAdjustment));
    }

    // Clamp values to ensure they stay within the 0-255 range
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  adjustContrast(data, adjustments.contrast);

  ctx.putImageData(imageData, 0, 0);
}


const Color = (canvas, color) => {
  adjustImage(canvas, color)
}

export default Color