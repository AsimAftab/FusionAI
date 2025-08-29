/**
 * Security Middleware
 * Handles security headers, rate limiting, and validation
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

class SecurityMiddleware {
    /**
     * Configure helmet for security headers
     */
    static helmet() {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:", "blob:"],
                    fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
                    connectSrc: ["'self'"],
                    mediaSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    frameAncestors: ["'none'"]
                }
            },
            crossOriginEmbedderPolicy: false // Allow embedding for development
        });
    }

    /**
     * Configure rate limiting
     */
    static rateLimiter() {
        return rateLimit({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        });
    }

    /**
     * API-specific rate limiter (more restrictive)
     */
    static apiRateLimiter() {
        return rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 20, // limit each IP to 20 API requests per minute
            message: {
                error: 'Too many API requests from this IP, please try again later.',
                retryAfter: '1 minute'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
    }

    /**
     * File upload rate limiter
     */
    static uploadRateLimiter() {
        return rateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 10, // limit each IP to 10 uploads per 5 minutes
            message: {
                error: 'Too many file uploads from this IP, please try again later.',
                retryAfter: '5 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
    }

    /**
     * Error handler middleware
     */
    static errorHandler() {
        return (error, req, res, next) => {
            console.error('Application error:', error);

            // Multer file upload errors
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size too large',
                    maxSize: '10MB'
                });
            }

            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    error: 'Unexpected file field'
                });
            }

            // Validation errors
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.message
                });
            }

            // Default error response
            const statusCode = error.statusCode || 500;
            const message = process.env.NODE_ENV === 'production' 
                ? 'Internal server error' 
                : error.message;

            res.status(statusCode).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString()
            });
        };
    }

    /**
     * 404 handler middleware
     */
    static notFoundHandler() {
        return (req, res) => {
            if (req.path.startsWith('/api/')) {
                res.status(404).json({
                    success: false,
                    error: 'API endpoint not found',
                    path: req.path
                });
            } else {
                res.status(404).render('404', {
                    title: 'Page Not Found',
                    message: `The page "${req.originalUrl}" could not be found.`
                });
            }
        };
    }
}

module.exports = SecurityMiddleware;
