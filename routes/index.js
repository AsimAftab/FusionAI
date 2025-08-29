/**
 * Main Routes
 * Application routing configuration
 */

const express = require('express');
const homeRoutes = require('./homeRoutes');
const chatRoutes = require('./chatRoutes');
const apiRoutes = require('./apiRoutes');

const router = express.Router();

// Mount route modules
router.use('/', homeRoutes);
router.use('/chat', chatRoutes);
router.use('/api', apiRoutes);

module.exports = router;
