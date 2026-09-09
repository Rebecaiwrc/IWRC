/**
 * Client-side image compressor utility.
 * Reduces large smartphone camera photos (5-15MB) to ~200-400KB without visible loss of quality.
 * Prevents payload size limits and network timeouts when uploading documents/photos to Supabase.
 */

export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<{ file: File; dataUrl: string; sizeStr: string }> {
  // If not an image (e.g. PDF, doc), return as is
  if (!file.type.startsWith('image/')) {
    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          file,
          dataUrl: reader.result as string,
          sizeStr
        });
      };
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback if canvas context fails
          const sizeStr = file.size > 1024 * 1024 
            ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
            : (file.size / 1024).toFixed(0) + ' KB';
          resolve({
            file,
            dataUrl: e.target?.result as string,
            sizeStr
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                dataUrl,
                sizeStr: (file.size / 1024).toFixed(0) + ' KB'
              });
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now()
            });

            const sizeStr = compressedFile.size > 1024 * 1024 
              ? (compressedFile.size / (1024 * 1024)).toFixed(1) + ' MB'
              : (compressedFile.size / 1024).toFixed(0) + ' KB';

            resolve({
              file: compressedFile,
              dataUrl,
              sizeStr
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        // Fallback on image loading error
        resolve({
          file,
          dataUrl: e.target?.result as string,
          sizeStr: (file.size / 1024).toFixed(0) + ' KB'
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
