
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/', requireRole(['super_admin', 'clinic_admin', 'doctor', 'receptionist']), patientController.getAllPatients);
router.get('/:id', requireRole(['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient']), patientController.getPatientById);
router.post('/', requireRole(['super_admin', 'clinic_admin', 'receptionist']), patientController.createPatient);
router.put('/:id', requireRole(['super_admin', 'clinic_admin', 'doctor', 'receptionist']), patientController.updatePatient);

module.exports = router;
