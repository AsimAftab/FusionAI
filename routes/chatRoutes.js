/**
 * Chat Routes
 * Routes for chat functionality and file uploads
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const ChatController = require('../controllers/chatController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/temp'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allow images and text files
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'text/markdown', 'application/json', 'text/xml', 'text/csv'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Single file upload
    }
});

// Validation middleware
const validateMessage = [
    body('message')
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Message must be between 1 and 5000 characters'),
    body('conversationHistory')
        .optional()
        .isArray()
        .withMessage('Conversation history must be an array')
];

const validateScreenshot = [
    body('imageData')
        .notEmpty()
        .withMessage('Image data is required'),
    body('message')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Message must be less than 1000 characters')
];

// Chat interface routes
router.get('/:model', ChatController.index);

// Message sending with optional file upload
router.post('/:model/send', upload.single('file'), validateMessage, ChatController.sendMessage);

// Screenshot upload
router.post('/:model/screenshot', validateScreenshot, ChatController.uploadScreenshot);

module.exports = router;
