// Otimizador de Fotos e Imagens Client-Side

/**
 * Otimiza imagens grandes (ex: fotos de 12MB-20MB da câmera do celular)
 * Reduz a resolução máxima para 2560px e comprime para WebP/JPEG mantendo nitidez.
 */
export async function optimizeImage(file, maxWidth = 2560, quality = 0.88) {
  // Se for GIF, SVG ou menor que 2MB, envia direto
  if (file.size < 2 * 1024 * 1024 || file.type.includes('gif') || file.type.includes('svg')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file); // se não reduziu, mantém o original
              return;
            }

            const optimizedFile = new File([blob], file.name, {
              type: targetMime,
              lastModified: Date.now()
            });

            resolve(optimizedFile);
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
