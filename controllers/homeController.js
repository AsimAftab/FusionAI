/**
 * Home Controller
 * Handles home page and general application routes
 */

const path = require('path');
const { validationResult } = require('express-validator');

class HomeController {
    /**
     * Render home page with available AI models
     */
    static async index(req, res) {
        try {
            const models = [
                {
                    id: 'gpt5',
                    name: 'GPT-5 Chat',
                    provider: 'Azure OpenAI',
                    description: 'Most advanced language model from OpenAI',
                    status: 'online',
                    capabilities: ['text', 'file-upload', 'screenshot'],
                    icon: 'fas fa-brain'
                },
                {
                    id: 'deepseek',
                    name: 'DeepSeek Chat',
                    provider: 'DeepSeek AI',
                    description: 'Advanced reasoning and coding capabilities',
                    status: 'online',
                    capabilities: ['text', 'file-upload'],
                    icon: 'fas fa-search'
                },
                {
                    id: 'grok',
                    name: 'Grok-3',
                    provider: 'xAI',
                    description: 'Real-time information with wit and humor',
                    status: 'offline',
                    capabilities: ['text'],
                    icon: 'fas fa-robot'
                },
                {
                    id: 'image-gen',
                    name: 'Image Generation',
                    provider: 'Azure OpenAI',
                    description: 'Create stunning images from text descriptions',
                    status: 'online',
                    capabilities: ['text-to-image'],
                    icon: 'fas fa-image'
                }
            ];

            res.render('index', { 
                title: 'FusionAI - Multiple AI Models Access',
                models,
                year: new Date().getFullYear()
            });
        } catch (error) {
            console.error('Error rendering home page:', error);
            res.status(500).render('error', { 
                error: 'Internal Server Error',
                message: 'Something went wrong loading the home page'
            });
        }
    }

    /**
     * Health check endpoint
     */
    static async healthCheck(req, res) {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0'
        });
    }

    /**
     * Configuration check endpoint
     */
    static async configCheck(req, res) {
        const config = {
            azure_openai: !!process.env.AZURE_OPENAI_API_KEY,
            deepseek: !!process.env.DEEPSEEK_API_KEY,
            grok: !!process.env.GROK_API_KEY,
            port: process.env.PORT || 3001,
            environment: process.env.NODE_ENV || 'development'
        };

        res.json({
            configured: config,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 404 Error handler
     */
    static notFound(req, res) {
        res.status(404).render('404', {
            title: 'Page Not Found',
            message: `The page "${req.originalUrl}" could not be found.`
        });
    }
}

module.exports = HomeController;
