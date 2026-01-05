
const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(requireAuth);

router.post('/', requireRole(['doctor']), prescriptionController.createPrescription);
router.get('/appointment/:appointment_id', requireRole(['super_admin', 'clinic_admin', 'doctor', 'patient']), prescriptionController.getPrescriptionByAppointment);

module.exports = router;
