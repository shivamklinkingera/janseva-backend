
const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/', clinicController.getAllClinics);
router.get('/doctors', clinicController.getLogicDoctors); // ?clinic_id=...
router.patch('/doctors/:id/availability', requireRole(['doctor', 'clinic_admin', 'super_admin']), clinicController.updateDoctorAvailability);

module.exports = router;
