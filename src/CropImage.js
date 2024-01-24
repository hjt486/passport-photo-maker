// CropImage.js

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });

export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions to the unrotated image dimensions
  const { width, height } = image;
  canvas.width = width;
  canvas.height = height;

  // Translate and rotate the context
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  // Draw the full-size image onto the canvas
  ctx.drawImage(image, 0, 0);

  // Create a second canvas to use for cropping
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');

  // Set the dimensions of the crop canvas to the cropped area size
  cropCanvas.width = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;

  // Fill the crop canvas with a white background
  cropCtx.fillStyle = '#ffffff';
  cropCtx.fillRect(0, 0, pixelCrop.width, pixelCrop.height);

  // Draw the rotated image onto the crop canvas
  cropCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert the crop canvas to a data URL and return it
  return new Promise((resolve) => {
    resolve(cropCanvas.toDataURL('image/jpeg'));
  });
}
