/**
 * Utilitário de Otimização e Compressão de Imagens no Cliente
 * Converte imagens para WebP com redimensionamento proporcional e envia ao Supabase Storage.
 */

const ImageOptimizer = {
    // Configurações padrão de compressão
    MAX_WIDTH: 1600,
    MAX_HEIGHT: 1600,
    WEBP_QUALITY: 0.82,

    /**
     * Comprime e converte um arquivo de imagem para WebP Blob
     * @param {File} file - Arquivo de imagem selecionado pelo usuário
     * @returns {Promise<{blob: Blob, name: string, originalSize: number, compressedSize: number}>}
     */
    async compressToWebP(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    // Cálculo proporcional de redimensionamento
                    if (width > height) {
                        if (width > ImageOptimizer.MAX_WIDTH) {
                            height = Math.round((height * ImageOptimizer.MAX_WIDTH) / width);
                            width = ImageOptimizer.MAX_WIDTH;
                        }
                    } else {
                        if (height > ImageOptimizer.MAX_HEIGHT) {
                            width = Math.round((width * ImageOptimizer.MAX_HEIGHT) / height);
                            height = ImageOptimizer.MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    // Melhor interpolação de imagem
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    // Converte para WebP
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Falha ao gerar Blob WebP'));
                                return;
                            }

                            // Gera nome sanitizado com timestamp
                            const cleanName = file.name
                                .toLowerCase()
                                .replace(/\.[^/.]+$/, '')
                                .replace(/[^a-z0-9]/g, '_')
                                .substring(0, 30);
                            const webpName = `paco_${cleanName}_${Date.now()}.webp`;

                            resolve({
                                blob: blob,
                                name: webpName,
                                originalSize: file.size,
                                compressedSize: blob.size,
                                width,
                                height
                            });
                        },
                        'image/webp',
                        ImageOptimizer.WEBP_QUALITY
                    );
                };
                img.onerror = (err) => reject(new Error('Erro ao carregar imagem para compressão'));
            };
            reader.onerror = (err) => reject(new Error('Erro ao ler arquivo'));
        });
    },

    /**
     * Envia o blob para o bucket do Supabase Storage
     * @param {Blob} blob - Arquivo comprimido
     * @param {string} fileName - Nome do arquivo
     * @param {Object} supabaseClient - Instância do cliente Supabase
     * @returns {Promise<string>} URL pública da imagem
     */
    async uploadToSupabase(blob, fileName, supabaseClient) {
        if (!supabaseClient) {
            throw new Error('Cliente Supabase não está conectado.');
        }

        const bucketName = 'produtos';

        // Faz o upload no bucket
        const { data, error } = await supabaseClient.storage
            .from(bucketName)
            .upload(`galeria/${fileName}`, blob, {
                contentType: 'image/webp',
                cacheControl: '31536000', // 1 ano de cache
                upsert: true
            });

        if (error) {
            console.error('[Storage Upload Error]:', error);
            throw new Error(`Erro ao enviar foto para o Supabase Storage: ${error.message}`);
        }

        // Obtém a URL pública direta
        const { data: publicData } = supabaseClient.storage
            .from(bucketName)
            .getPublicUrl(`galeria/${fileName}`);

        return publicData.publicUrl;
    }
};

window.ImageOptimizer = ImageOptimizer;
