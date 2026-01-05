
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/stats', requireRole(['super_admin', 'clinic_admin', 'doctor']), dashboardController.getStats);

module.exports = router;
