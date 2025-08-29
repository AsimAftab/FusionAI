/**
 * Chat Controller
 * Handles all chat-related functionality including file uploads
 */

const path = require('path');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');
const AIService = require('../services/aiService');
const FileUploadService = require('../services/fileUploadService');

class ChatController {
    /**
     * Render chat interface for specific model
     */
    static async index(req, res) {
        try {
            const { model } = req.params;
            const validModels = ['gpt5', 'deepseek', 'grok', 'image-gen'];
            
            if (!validModels.includes(model)) {
                return res.redirect('/');
            }

            const modelConfig = ChatController.getModelConfig(model);
            
            res.render('chat', {
                title: `${modelConfig.name} - FusionAI`,
                model: modelConfig,
                maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
                // Serialize data for JavaScript
                modelDataJson: JSON.stringify({
                    id: modelConfig.id,
                    name: modelConfig.name,
                    description: modelConfig.description,
                    capabilities: modelConfig.capabilities || [],
                    maxTokens: modelConfig.maxTokens || 4096
                })
            });
        } catch (error) {
            console.error('Error rendering chat page:', error);
            res.status(500).render('error', {
                error: 'Internal Server Error',
                message: 'Failed to load chat interface'
            });
        }
    }

    /**
     * Handle chat message with optional file upload
     */
    static async sendMessage(req, res) {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { model } = req.params;
            const { message, conversationHistory = [] } = req.body;
            const file = req.file;

            // Process file if uploaded
            let fileContent = null;
            if (file) {
                fileContent = await FileUploadService.processFile(file);
            }

            // Get AI response
            const response = await AIService.generateResponse(model, {
                message,
                fileContent,
                conversationHistory
            });

            // Clean up uploaded file
            if (file) {
                await FileUploadService.cleanupFile(file.path);
            }

            res.json({
                success: true,
                response,
                model,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error processing chat message:', error);
            
            // Clean up file on error
            if (req.file) {
                await FileUploadService.cleanupFile(req.file.path).catch(console.error);
            }

            res.status(500).json({
                success: false,
                error: 'Failed to process message',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Handle screenshot paste functionality
     */
    static async uploadScreenshot(req, res) {
        try {
            const { model } = req.params;
            const { imageData, message = '' } = req.body;

            if (!imageData) {
                return res.status(400).json({
                    success: false,
                    error: 'No image data provided'
                });
            }

            // Process base64 image
            const processedImage = await FileUploadService.processBase64Image(imageData);
            
            // Get AI response for image
            const response = await AIService.generateResponse(model, {
                message: message || 'Analyze this screenshot',
                fileContent: {
                    type: 'image',
                    data: processedImage,
                    filename: 'screenshot.png'
                }
            });

            res.json({
                success: true,
                response,
                model,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error processing screenshot:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process screenshot',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get model configuration
     */
    static getModelConfig(modelId) {
        const configs = {
            gpt5: {
                id: 'gpt5',
                name: 'GPT-5 Chat',
                provider: 'Azure OpenAI',
                description: 'Most advanced language model from OpenAI',
                capabilities: ['text', 'file-upload', 'screenshot'],
                maxTokens: 4096,
                supportedFiles: ['txt', 'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif']
            },
            deepseek: {
                id: 'deepseek',
                name: 'DeepSeek Chat',
                provider: 'DeepSeek AI',
                description: 'Advanced reasoning and coding capabilities',
                capabilities: ['text', 'file-upload'],
                maxTokens: 2048,
                supportedFiles: ['txt', 'pdf', 'doc', 'docx']
            },
            grok: {
                id: 'grok',
                name: 'Grok-3',
                provider: 'xAI',
                description: 'Real-time information with wit and humor',
                capabilities: ['text'],
                maxTokens: 2048,
                supportedFiles: []
            },
            'image-gen': {
                id: 'image-gen',
                name: 'Image Generation',
                provider: 'Azure OpenAI',
                description: 'Create stunning images from text descriptions',
                capabilities: ['text-to-image'],
                maxTokens: 1000,
                supportedFiles: []
            }
        };

        return configs[modelId] || configs.gpt5;
    }
}

module.exports = ChatController;
