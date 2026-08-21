/**
 * Utilitário de Otimização e Compressão de Imagens no Cliente
 * Converte imagens para WebP com redimensionamento proporcional e envia ao Firebase Storage.
 */

const ImageOptimizer = {
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
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Falha ao gerar Blob WebP'));
                                return;
                            }

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
                img.onerror = () => reject(new Error('Erro ao carregar imagem para compressão'));
            };
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        });
    },

    /**
     * Envia o blob para o Firebase Storage
     * @param {Blob} blob - Arquivo comprimido
     * @param {string} fileName - Nome do arquivo
     * @returns {Promise<string>} URL pública de download da imagem
     */
    async uploadToFirebase(blob, fileName) {
        if (!FirebaseService.isConfigured || !FirebaseService.storage) {
            throw new Error('Firebase Storage não está conectado.');
        }

        const storageRef = FirebaseService.storage.ref(`produtos/${fileName}`);
        const metadata = {
            contentType: 'image/webp',
            cacheControl: 'public, max-age=31536000'
        };

        const snapshot = await storageRef.put(blob, metadata);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        return downloadUrl;
    }
};

window.ImageOptimizer = ImageOptimizer;
