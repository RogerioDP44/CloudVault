// Utilitários de Compartilhamento e Download

/**
 * Compartilha o arquivo usando a API nativa do celular (WhatsApp, Telegram, etc.)
 * ou copia o link caso não haja suporte nativo
 */
export async function shareFile(fileItem, onToast = () => {}) {
  const shareData = {
    title: fileItem.original_name || 'Arquivo CloudVault',
    text: `Confira este arquivo salvo no CloudVault: ${fileItem.original_name}`,
    url: fileItem.file_url
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      onToast({ type: 'success', message: 'Compartilhado com sucesso!' });
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Erro ao compartilhar:', err);
      } else {
        return; // Usuário apenas cancelou o menu de compartilhar
      }
    }
  }

  // Fallback: Copia o link direto para a área de transferência
  try {
    await navigator.clipboard.writeText(fileItem.file_url);
    onToast({ type: 'success', message: 'Link copiado para a área de transferência!' });
  } catch (clipErr) {
    onToast({ type: 'info', message: 'Link: ' + fileItem.file_url });
  }
}

/**
 * Força o download do arquivo no dispositivo
 */
export async function downloadFile(fileItem, onToast = () => {}) {
  try {
    onToast({ type: 'info', message: 'Iniciando download...' });
    
    // Se for data URL local ou mesmo domínio
    if (fileItem.file_url.startsWith('data:') || fileItem.file_url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = fileItem.file_url;
      a.download = fileItem.original_name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onToast({ type: 'success', message: 'Download concluído!' });
      return;
    }

    // Busca como blob para garantir download mesmo de CDN
    const response = await fetch(fileItem.file_url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileItem.original_name || 'arquivo';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);

    onToast({ type: 'success', message: 'Download concluído!' });
  } catch (e) {
    // Fallback simples
    window.open(fileItem.file_url, '_blank');
  }
}
