// Motor de Compressão de Vídeo Client-Side (No próprio celular/navegador)

const SUPABASE_MAX_LIMIT_BYTES = 50 * 1024 * 1024; // 50 Megabytes

/**
 * Verifica se o arquivo precisa de compressão antes do upload
 */
export function needsCompression(file) {
  if (!file) return false;
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm)$/i.test(file.name);
  return isVideo && file.size > SUPABASE_MAX_LIMIT_BYTES;
}

/**
 * Comprime um arquivo de vídeo usando HTML5 Video + Canvas + MediaRecorder
 * Reduz a resolução e o bitrate preservando excelente qualidade para telas mobile.
 * 
 * @param {File} videoFile - O arquivo de vídeo original
 * @param {Function} onProgress - Callback de progresso (0 a 100)
 * @returns {Promise<File>} - O arquivo comprimido pronto para upload
 */
export async function compressVideoClientSide(videoFile, onProgress = () => {}) {
  // Se for menor que 50MB, não precisa recomprimir obrigatoriamente
  if (videoFile.size <= SUPABASE_MAX_LIMIT_BYTES) {
    onProgress(100);
    return videoFile;
  }

  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      const fileUrl = URL.createObjectURL(videoFile);
      video.src = fileUrl;

      video.onloadedmetadata = async () => {
        try {
          const originalWidth = video.videoWidth || 1920;
          const originalHeight = video.videoHeight || 1080;
          const duration = video.duration || 10;

          // Calcula a escala máxima (Max 720p para vídeos muito pesados)
          let targetWidth = originalWidth;
          let targetHeight = originalHeight;
          const MAX_DIMENSION = 1280;

          if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
            if (targetWidth > targetHeight) {
              targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
              targetWidth = MAX_DIMENSION;
            } else {
              targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
              targetHeight = MAX_DIMENSION;
            }
          }

          // Garante dimensões pares (necessário para encoders)
          targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
          targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d', { alpha: false });

          // Configura stream e MediaRecorder
          const stream = canvas.captureStream(30); // 30 FPS
          
          // Tenta pegar codecs suportados (MP4 / WebM H264)
          const mimeTypes = [
            'video/mp4;codecs=avc1',
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
          ];
          
          let selectedMimeType = '';
          for (const mime of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mime)) {
              selectedMimeType = mime;
              break;
            }
          }

          if (!selectedMimeType) {
            selectedMimeType = 'video/webm';
          }

          // Bitrate dinâmico calculado para ficar com folga abaixo dos 45MB
          const targetBitrate = Math.min(2500000, Math.floor((40 * 1024 * 1024 * 8) / (duration || 60)));
          
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: selectedMimeType,
            videoBitsPerSecond: targetBitrate
          });

          const chunks = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            URL.revokeObjectURL(fileUrl);
            const blob = new Blob(chunks, { type: selectedMimeType });
            
            const ext = selectedMimeType.includes('mp4') ? '.mp4' : '.webm';
            const baseName = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) || videoFile.name;
            const compressedFile = new File([blob], `${baseName}_comprimido${ext}`, {
              type: selectedMimeType,
              lastModified: Date.now()
            });

            onProgress(100);
            resolve(compressedFile);
          };

          mediaRecorder.start(100); // chunk a cada 100ms
          video.play();

          const drawFrame = () => {
            if (video.paused || video.ended) {
              if (video.ended) {
                mediaRecorder.stop();
              }
              return;
            }

            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            
            if (duration > 0) {
              const currentPercent = Math.min(95, Math.round((video.currentTime / duration) * 95));
              onProgress(currentPercent);
            }

            requestAnimationFrame(drawFrame);
          };

          drawFrame();

          video.onerror = (err) => {
            URL.revokeObjectURL(fileUrl);
            console.warn('Erro na reprodução para compressão, enviando original:', err);
            resolve(videoFile);
          };

        } catch (innerErr) {
          URL.revokeObjectURL(fileUrl);
          console.warn('Compressão de vídeo falhou, enviando arquivo original:', innerErr);
          resolve(videoFile);
        }
      };

      video.onerror = (err) => {
        URL.revokeObjectURL(fileUrl);
        console.warn('Não foi possível carregar vídeo para compressão:', err);
        resolve(videoFile);
      };

    } catch (e) {
      console.warn('Falha geral na compressão:', e);
      resolve(videoFile);
    }
  });
}
