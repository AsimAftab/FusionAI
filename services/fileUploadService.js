/**
 * File Upload Service
 * Handles file uploads, processing, and cleanup
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class FileUploadService {
    /**
     * Process uploaded file based on type
     */
    static async processFile(file) {
        try {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const mimeType = file.mimetype;

            // Determine file type
            if (this.isImageFile(fileExtension, mimeType)) {
                return await this.processImageFile(file);
            } else if (this.isTextFile(fileExtension, mimeType)) {
                return await this.processTextFile(file);
            } else {
                throw new Error(`Unsupported file type: ${fileExtension}`);
            }
        } catch (error) {
            console.error('File processing error:', error);
            throw error;
        }
    }

    /**
     * Process image files
     */
    static async processImageFile(file) {
        try {
            // Read and optimize image
            const imageBuffer = await fs.readFile(file.path);
            
            // Resize if too large (max 1024x1024)
            const processedImage = await sharp(imageBuffer)
                .resize(1024, 1024, { 
                    fit: 'inside',
                    withoutEnlargement: true 
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            // Convert to base64 for AI processing
            const base64Image = processedImage.toString('base64');

            return {
                type: 'image',
                data: base64Image,
                filename: file.originalname,
                size: processedImage.length,
                mimeType: 'image/jpeg'
            };
        } catch (error) {
            throw new Error(`Image processing failed: ${error.message}`);
        }
    }

    /**
     * Process text files
     */
    static async processTextFile(file) {
        try {
            const content = await fs.readFile(file.path, 'utf-8');
            
            // Limit text content size (max 50KB)
            const maxSize = 50 * 1024; // 50KB
            const truncatedContent = content.length > maxSize 
                ? content.substring(0, maxSize) + '\n... (content truncated)'
                : content;

            return {
                type: 'text',
                data: truncatedContent,
                filename: file.originalname,
                size: content.length,
                mimeType: file.mimetype
            };
        } catch (error) {
            throw new Error(`Text file processing failed: ${error.message}`);
        }
    }

    /**
     * Process base64 image from screenshot paste
     */
    static async processBase64Image(base64Data) {
        try {
            // Remove data URL prefix if present
            const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
            const imageBuffer = Buffer.from(base64Image, 'base64');

            // Process with sharp
            const processedImage = await sharp(imageBuffer)
                .resize(1024, 1024, { 
                    fit: 'inside',
                    withoutEnlargement: true 
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            return {
                type: 'image',
                data: processedImage.toString('base64'),
                filename: 'screenshot.jpg',
                size: processedImage.length,
                mimeType: 'image/jpeg'
            };
        } catch (error) {
            throw new Error(`Screenshot processing failed: ${error.message}`);
        }
    }

    /**
     * Clean up uploaded file
     */
    static async cleanupFile(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('File cleanup error:', error);
            // Don't throw - cleanup errors shouldn't break the flow
        }
    }

    /**
     * Check if file is an image
     */
    static isImageFile(extension, mimeType) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        
        return imageExtensions.includes(extension) || imageMimeTypes.includes(mimeType);
    }

    /**
     * Check if file is a text file
     */
    static isTextFile(extension, mimeType) {
        const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv', '.log'];
        const textMimeTypes = ['text/plain', 'text/markdown', 'application/json', 'text/xml', 'text/csv'];
        
        return textExtensions.includes(extension) || 
               imageMimeTypes.includes(mimeType) ||
               mimeType.startsWith('text/');
    }

    /**
     * Get supported file types for a model
     */
    static getSupportedFileTypes(modelId) {
        const supportedTypes = {
            gpt5: {
                images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                texts: ['.txt', '.md', '.json', '.xml', '.csv'],
                maxSize: '10MB'
            },
            deepseek: {
                images: [],
                texts: ['.txt', '.md', '.json', '.xml', '.csv'],
                maxSize: '5MB'
            },
            grok: {
                images: [],
                texts: [],
                maxSize: '0MB'
            },
            'image-gen': {
                images: [],
                texts: [],
                maxSize: '0MB'
            }
        };

        return supportedTypes[modelId] || supportedTypes.gpt5;
    }
}

module.exports = FileUploadService;
