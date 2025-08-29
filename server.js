/**
 * FusionAI Server
 * Professional Express.js server with MVC architecture
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Import middleware and routes
const SecurityMiddleware = require('./middleware/security');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(SecurityMiddleware.helmet());
app.use(SecurityMiddleware.rateLimiter());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') 
        : true,
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API rate limiting for specific routes
app.use('/api', SecurityMiddleware.apiRateLimiter());
app.use('/chat/*/send', SecurityMiddleware.uploadRateLimiter());
app.use('/chat/*/screenshot', SecurityMiddleware.uploadRateLimiter());

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use(SecurityMiddleware.errorHandler());

// 404 handler (must be last)
app.use(SecurityMiddleware.notFoundHandler());

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 FusionAI server running on http://localhost:' + PORT);
    console.log('📊 Available models: GPT-5 Chat, DeepSeek Chat, Grok-3, Image Generation');
    console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
    console.log('💾 File uploads enabled with 10MB limit');
    console.log('📸 Screenshot paste functionality available');
});

module.exports = app;