
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/', requireRole(['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient']), appointmentController.getAppointments);
router.post('/', requireRole(['super_admin', 'clinic_admin', 'receptionist', 'patient']), appointmentController.createAppointment);
router.patch('/:id/status', requireRole(['super_admin', 'clinic_admin', 'doctor', 'receptionist']), appointmentController.updateStatus);

module.exports = router;
