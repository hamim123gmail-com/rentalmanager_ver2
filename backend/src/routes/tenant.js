const express = require('express');
const router = express.Router();
const { verifyToken, isTenant } = require('../middleware/auth');
const {
    getDashboard,
    getPaymentHistory,
    submitMaintenance,
    getMaintenanceRequests,
    updateProfile,
    changePassword
} = require('../controllers/tenantController');

// All routes protected by verifyToken and isTenant
router.use(verifyToken, isTenant);

// Dashboard
router.get('/dashboard', getDashboard);

// Payment routes
router.get('/payments', getPaymentHistory);

// Maintenance routes
router.post('/maintenance', submitMaintenance);
router.get('/maintenance', getMaintenanceRequests);

// Profile routes
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;