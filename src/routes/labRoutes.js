
const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(requireAuth);

router.post('/', requireRole(['doctor', 'clinic_admin', 'super_admin']), labController.uploadReport);
router.get('/patient/:patient_id', requireRole(['doctor', 'clinic_admin', 'super_admin', 'patient']), labController.getPatientReports);

module.exports = router;
