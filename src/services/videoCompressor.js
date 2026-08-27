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
 * Comprime um arquivo de vídeo usando HTML5 Video + Canvas + MediaRecorder.
 * Captura ÁUDIO via AudioContext para preservar o som no arquivo comprimido.
 *
 * @param {File} videoFile - O arquivo de vídeo original
 * @param {Function} onProgress - Callback de progresso (0 a 100)
 * @returns {Promise<File>} - O arquivo comprimido pronto para upload
 */
export async function compressVideoClientSide(videoFile, onProgress = () => {}) {
  if (videoFile.size <= SUPABASE_MAX_LIMIT_BYTES) {
    onProgress(100);
    return videoFile;
  }

  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      // NÃO mutar — áudio precisa fluir pelo AudioContext para ser capturado
      video.muted = false;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      const fileUrl = URL.createObjectURL(videoFile);
      video.src = fileUrl;

      video.onloadedmetadata = async () => {
        try {
          const originalWidth  = video.videoWidth  || 1920;
          const originalHeight = video.videoHeight || 1080;
          const duration       = video.duration    || 10;

          // Escala máxima 720p para vídeos pesados
          let targetWidth  = originalWidth;
          let targetHeight = originalHeight;
          const MAX_DIMENSION = 1280;

          if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
            if (targetWidth > targetHeight) {
              targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
              targetWidth  = MAX_DIMENSION;
            } else {
              targetWidth  = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
              targetHeight = MAX_DIMENSION;
            }
          }

          // Dimensões pares obrigatórias para encoders de vídeo
          targetWidth  = targetWidth  % 2 === 0 ? targetWidth  : targetWidth  - 1;
          targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

          const canvas = document.createElement('canvas');
          canvas.width  = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d', { alpha: false });

          // ── CAPTURA DE ÁUDIO ──────────────────────────────────────
          // Captura o stream de áudio do elemento <video> via AudioContext
          // e adiciona ao stream do canvas para gravar junto ao vídeo.
          const videoStream = canvas.captureStream(30);

          let audioCtx = null;
          try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source   = audioCtx.createMediaElementSource(video);
            const audioDest = audioCtx.createMediaStreamDestination();

            // Conecta apenas ao destino de gravação (sem tocar nos alto-falantes
            // durante a compressão — experiência mais limpa para o usuário)
            source.connect(audioDest);

            const audioTracks = audioDest.stream.getAudioTracks();
            audioTracks.forEach(track => videoStream.addTrack(track));
          } catch (audioErr) {
            // Sem áudio disponível — prossegue só com vídeo
            console.warn('[Compressor] Áudio não pôde ser capturado:', audioErr);
          }
          // ──────────────────────────────────────────────────────────

          // Codecs com suporte a áudio (WebM+Opus é o mais confiável nos navegadores)
          const mimeTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
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
          if (!selectedMimeType) selectedMimeType = 'video/webm';

          // Bitrate dinâmico: cabe em ~45 MB com boa qualidade
          const targetBitrate = Math.min(2_500_000, Math.floor((40 * 1024 * 1024 * 8) / (duration || 60)));

          const mediaRecorder = new MediaRecorder(videoStream, {
            mimeType: selectedMimeType,
            videoBitsPerSecond: targetBitrate,
            audioBitsPerSecond: 128_000   // 128 kbps de áudio
          });

          const chunks = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            URL.revokeObjectURL(fileUrl);
            if (audioCtx) audioCtx.close().catch(() => {});

            const blob = new Blob(chunks, { type: selectedMimeType });
            const ext  = selectedMimeType.includes('mp4') ? '.mp4' : '.webm';
            const baseName = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) || videoFile.name;

            const compressedFile = new File([blob], `${baseName}_comprimido${ext}`, {
              type: selectedMimeType,
              lastModified: Date.now()
            });

            onProgress(100);
            resolve(compressedFile);
          };

          mediaRecorder.onerror = (err) => {
            console.warn('[Compressor] Erro no MediaRecorder, enviando original:', err);
            URL.revokeObjectURL(fileUrl);
            if (audioCtx) audioCtx.close().catch(() => {});
            resolve(videoFile);
          };

          mediaRecorder.start(100); // chunk a cada 100ms
          video.play();

          const drawFrame = () => {
            if (video.paused || video.ended) {
              if (video.ended) mediaRecorder.stop();
              return;
            }
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

            if (duration > 0) {
              onProgress(Math.min(95, Math.round((video.currentTime / duration) * 95)));
            }
            requestAnimationFrame(drawFrame);
          };

          drawFrame();

          video.onerror = (err) => {
            URL.revokeObjectURL(fileUrl);
            console.warn('[Compressor] Erro na reprodução, enviando original:', err);
            resolve(videoFile);
          };

        } catch (innerErr) {
          URL.revokeObjectURL(fileUrl);
          console.warn('[Compressor] Compressão falhou, enviando original:', innerErr);
          resolve(videoFile);
        }
      };

      video.onerror = (err) => {
        URL.revokeObjectURL(fileUrl);
        console.warn('[Compressor] Não foi possível carregar vídeo:', err);
        resolve(videoFile);
      };

    } catch (e) {
      console.warn('[Compressor] Falha geral:', e);
      resolve(videoFile);
    }
  });
}
