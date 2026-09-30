/**
 * Utilitário de Otimização e Compressão de Imagens no Cliente
 * Converte imagens para WebP com redimensionamento proporcional e envia ao Firebase Storage.
 */

const ImageOptimizer = {
    MAX_WIDTH: 1600,
    MAX_HEIGHT: 1600,
    WEBP_QUALITY: 0.82,

    /**
     * Comprime e converte um arquivo ou Blob de imagem para WebP Blob
     * @param {File|Blob} fileOrBlob - Arquivo de imagem ou Blob
     * @param {string} suggestedName - Nome sugerido caso seja um Blob sem nome
     * @returns {Promise<{blob: Blob, name: string, originalSize: number, compressedSize: number, width: number, height: number}>}
     */
    async compressToWebP(fileOrBlob, suggestedName = 'foto') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(fileOrBlob);
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

                            const rawName = (fileOrBlob && fileOrBlob.name) ? fileOrBlob.name : suggestedName;
                            const cleanName = String(rawName)
                                .toLowerCase()
                                .replace(/\.[^/.]+$/, '')
                                .replace(/[^a-z0-9]/g, '_')
                                .substring(0, 30) || 'foto';
                            const webpName = `paco_${cleanName}_${Date.now()}.webp`;

                            resolve({
                                blob: blob,
                                name: webpName,
                                originalSize: (fileOrBlob && fileOrBlob.size) ? fileOrBlob.size : blob.size,
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
     * Baixa uma imagem via URL (suportando endpoints do Google Drive com CORS)
     * @param {string} url - URL direta ou do Google Drive
     * @returns {Promise<Blob>}
     */
    async fetchImageBlob(url) {
        let fetchUrl = String(url || '').trim();
        const driveId = typeof extractDriveFileId === 'function' ? extractDriveFileId(fetchUrl) : null;
        if (driveId) {
            // Utiliza o endpoint direto lh3 que possui cabeçalho Access-Control-Allow-Origin: *
            fetchUrl = `https://lh3.googleusercontent.com/d/${driveId}=w1600`;
        }

        const response = await fetch(fetchUrl, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Falha ao baixar imagem (${response.status} ${response.statusText})`);
        }
        return await response.blob();
    },

    /**
     * Baixa imagem de uma URL, converte para WebP e envia ao Firebase Storage
     * @param {string} url - URL da imagem
     * @param {string} baseName - Nome base do arquivo
     * @returns {Promise<string>} URL pública no Storage ou DataURL
     */
    async optimizeAndUploadUrl(url, baseName = 'foto') {
        const driveId = typeof extractDriveFileId === 'function' ? extractDriveFileId(url) : null;
        const nameToUse = driveId ? `drive_${driveId.substring(0, 10)}` : baseName;
        const blob = await this.fetchImageBlob(url);
        const compressed = await this.compressToWebP(blob, nameToUse);

        if (FirebaseService.isConfigured && FirebaseService.storage) {
            try {
                const downloadUrl = await this.uploadToFirebase(compressed.blob, compressed.name);
                return downloadUrl;
            } catch (storageErr) {
                console.warn('[ImageOptimizer] Falha no upload para o Storage. Usando dataURL local:', storageErr);
            }
        }

        // Modo offline / fallback
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(compressed.blob);
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
