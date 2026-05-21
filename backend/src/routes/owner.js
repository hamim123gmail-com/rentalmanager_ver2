const express = require('express');
const router = express.Router();
const { verifyToken, isOwner } = require('../middleware/auth');
const {
    getProperties,
    addProperty,
    editProperty,
    deleteProperty,
    getTenants,
    addTenant,
    getPayments,
    recordPayment,
    updatePayment,
    deactivateTenant,
    getMaintenanceRequests,
    updateMaintenanceStatus,
    getFinancialReport
} = require('../controllers/ownerController');

// All routes protected by verifyToken and isOwner
router.use(verifyToken, isOwner);

// Property routes
router.get('/properties', getProperties);
router.post('/properties', addProperty);
router.put('/properties/:id', editProperty);
router.delete('/properties/:id', deleteProperty);

// Tenant routes
router.get('/tenants', getTenants);
router.post('/tenants', addTenant);
router.put('/tenants/:id/deactivate', deactivateTenant);


// Payment routes
router.get('/payments', getPayments);
router.post('/payments', recordPayment);
router.put('/payments/:id', updatePayment);

// Maintenance routes
router.get('/maintenance', getMaintenanceRequests);
router.put('/maintenance/:id', updateMaintenanceStatus);

// Financial report
router.get('/reports', getFinancialReport);

module.exports = router;