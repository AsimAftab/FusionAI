/**
 * API Routes
 * RESTful API endpoints for application data
 */

const express = require('express');
const HomeController = require('../controllers/homeController');
const AIService = require('../services/aiService');

const router = express.Router();

// Configuration check
router.get('/config-check', HomeController.configCheck);

// Model availability check
router.get('/models/status', (req, res) => {
    const models = ['gpt5', 'deepseek', 'grok', 'image-gen'];
    const status = {};
    
    models.forEach(model => {
        status[model] = AIService.isModelAvailable(model);
    });
    
    res.json({
        status,
        timestamp: new Date().toISOString()
    });
});

// Get supported file types for a model
router.get('/models/:model/file-types', (req, res) => {
    const { model } = req.params;
    const FileUploadService = require('../services/fileUploadService');
    
    try {
        const supportedTypes = FileUploadService.getSupportedFileTypes(model);
        res.json({
            model,
            supportedTypes,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(400).json({
            error: 'Invalid model specified',
            model
        });
    }
});

// System information
router.get('/system/info', (req, res) => {
    res.json({
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
