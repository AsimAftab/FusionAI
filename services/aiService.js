/**
 * AI Service
 * Handles all AI model interactions and API calls
 */

const axios = require('axios');

class AIService {
    /**
     * Generate response from specified AI model
     */
    static async generateResponse(modelId, options) {
        const { message, fileContent, conversationHistory = [] } = options;

        switch (modelId) {
            case 'gpt5':
                return await this.handleAzureOpenAI(message, fileContent, conversationHistory);
            case 'deepseek':
                return await this.handleDeepSeek(message, fileContent, conversationHistory);
            case 'grok':
                return await this.handleGrok(message, conversationHistory);
            case 'image-gen':
                return await this.handleImageGeneration(message);
            default:
                throw new Error(`Unsupported model: ${modelId}`);
        }
    }

    /**
     * Handle Azure OpenAI GPT-5 requests
     */
    static async handleAzureOpenAI(message, fileContent, conversationHistory) {
        try {
            const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const apiKey = process.env.AZURE_OPENAI_API_KEY;
            const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
            const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

            if (!endpoint || !apiKey || !deploymentName) {
                throw new Error('Azure OpenAI configuration is incomplete');
            }

            // Build messages array
            const messages = [
                {
                    role: 'system',
                    content: 'You are GPT-5, an advanced AI assistant. Provide helpful, accurate, and detailed responses.'
                },
                ...conversationHistory,
                {
                    role: 'user',
                    content: this.buildMessageContent(message, fileContent)
                }
            ];

            const requestData = {
                messages,
                max_tokens: 4096,
                temperature: 0.7,
                top_p: 0.95,
                frequency_penalty: 0,
                presence_penalty: 0
            };

            const response = await axios.post(
                `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': apiKey
                    },
                    timeout: 30000
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: 'GPT-5',
                provider: 'Azure OpenAI',
                usage: response.data.usage
            };

        } catch (error) {
            console.error('Azure OpenAI error:', error.response?.data || error.message);
            throw new Error(`Azure OpenAI error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Handle DeepSeek requests
     */
    static async handleDeepSeek(message, fileContent, conversationHistory) {
        try {
            const endpoint = process.env.DEEPSEEK_ENDPOINT;
            const apiKey = process.env.DEEPSEEK_API_KEY;
            const model = process.env.DEEPSEEK_MODEL;
            const apiVersion = process.env.DEEPSEEK_API_VERSION;

            if (!endpoint || !apiKey || !model) {
                throw new Error('DeepSeek configuration is incomplete');
            }

            // Build messages array
            const messages = [
                {
                    role: 'system',
                    content: 'You are DeepSeek, an advanced AI with strong reasoning and coding capabilities. Provide thoughtful and detailed responses.'
                },
                ...conversationHistory,
                {
                    role: 'user',
                    content: this.buildMessageContent(message, fileContent)
                }
            ];

            const requestData = {
                messages,
                model,
                max_tokens: 2048,
                temperature: 0.7
            };

            const response = await axios.post(
                `${endpoint}/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': apiKey
                    },
                    timeout: 30000
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: 'DeepSeek',
                provider: 'DeepSeek AI',
                usage: response.data.usage
            };

        } catch (error) {
            console.error('DeepSeek error:', error.response?.data || error.message);
            throw new Error(`DeepSeek error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Handle Grok requests (offline mode)
     */
    static async handleGrok(message, conversationHistory) {
        // Simulate offline response
        return {
            content: "I'm currently offline for maintenance. Grok-3 will be back online soon with enhanced capabilities!",
            model: 'Grok-3',
            provider: 'xAI',
            status: 'offline'
        };
    }

    /**
     * Handle image generation requests
     */
    static async handleImageGeneration(prompt) {
        try {
            const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const apiKey = process.env.AZURE_OPENAI_API_KEY;
            const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

            if (!endpoint || !apiKey) {
                throw new Error('Azure OpenAI configuration is incomplete');
            }

            const requestData = {
                prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "natural"
            };

            const response = await axios.post(
                `${endpoint}/openai/deployments/dall-e-3/images/generations?api-version=${apiVersion}`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': apiKey
                    },
                    timeout: 60000
                }
            );

            return {
                content: `Image generated successfully for prompt: "${prompt}"`,
                imageUrl: response.data.data[0].url,
                model: 'DALL-E 3',
                provider: 'Azure OpenAI',
                prompt
            };

        } catch (error) {
            console.error('Image generation error:', error.response?.data || error.message);
            throw new Error(`Image generation error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Build message content including file information
     */
    static buildMessageContent(message, fileContent) {
        if (!fileContent) {
            return message;
        }

        let content = message;

        if (fileContent.type === 'text') {
            content += `\n\n[File content from ${fileContent.filename}]:\n${fileContent.data}`;
        } else if (fileContent.type === 'image') {
            content += `\n\n[Image uploaded: ${fileContent.filename}]`;
            // For image models, you might want to include the image data differently
        }

        return content;
    }

    /**
     * Validate model availability
     */
    static isModelAvailable(modelId) {
        const availableModels = {
            gpt5: !!process.env.AZURE_OPENAI_API_KEY,
            deepseek: !!process.env.DEEPSEEK_API_KEY,
            grok: false, // Offline
            'image-gen': !!process.env.AZURE_OPENAI_API_KEY
        };

        return availableModels[modelId] || false;
    }
}

module.exports = AIService;
