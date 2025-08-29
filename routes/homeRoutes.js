/**
 * Home Routes
 * Routes for home page and general application pages
 */

const express = require('express');
const HomeController = require('../controllers/homeController');

const router = express.Router();

// Home page
router.get('/', HomeController.index);

// Health check
router.get('/health', HomeController.healthCheck);

module.exports = router;
