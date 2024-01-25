export const resizeAndCompressImage = (imageData, targetWidth, targetHeight, maxSizeKB) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageData;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions while preserving aspect ratio
      let newWidth = targetWidth;
      let newHeight = targetHeight;
      const aspectRatio = img.width / img.height;

      if (newWidth / aspectRatio > newHeight) {
        newWidth = newHeight * aspectRatio;
      } else {
        newHeight = newWidth / aspectRatio;
      }

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw white background
      ctx.fillStyle = '#FFFFFF'; // Set the color to white
      ctx.fillRect(0, 0, newWidth, newHeight); // Fill the canvas with white

      // Initialize quality
      let quality = 1.0;

      const compressImage = () => {
        // Create a Blob with JPEG format and current quality
        canvas.toBlob(
          (blob) => {
            if (blob.size / 1024 <= maxSizeKB || quality <= 0) {
              resolve(blob);
            } else {
              // Reduce quality and try again
              quality -= 0.1; // You can adjust the step size here
              canvas.toBlob(compressImage, 'image/jpeg', quality);
            }
          },
          'image/jpeg',
          quality
        );
      };

      // Draw the image on top of the white background
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Start compression with the initial quality
      compressImage();
    };

    img.onerror = () => {
      reject(new Error('Failed to load image.'));
    };
  });
};
