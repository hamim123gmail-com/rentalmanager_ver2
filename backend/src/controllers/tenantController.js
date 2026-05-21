const db = require('../config/db');

// GET TENANT DASHBOARD INFO
const getDashboard = async (req, res) => {
    try {
        // Get tenant assignment and property details
        const [assignments] = await db.query(
            `SELECT ta.*, p.address, p.unit_number, p.rent_amount, p.due_date,
            u.name as owner_name, u.email as owner_email, u.phone as owner_phone
            FROM tenant_assignments ta
            JOIN properties p ON p.id = ta.property_id
            JOIN users u ON u.id = p.owner_id
            WHERE ta.tenant_id = ? AND ta.is_active = 1`,
            [req.user.id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ message: 'No active assignment found' });
        }

        // Get latest payment status
        const [payments] = await db.query(
            `SELECT * FROM payments 
            WHERE tenant_id = ? 
            ORDER BY created_at DESC LIMIT 1`,
            [req.user.id]
        );

        res.json({
            assignment: assignments[0],
            latest_payment: payments[0] || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET TENANT PAYMENT HISTORY
const getPaymentHistory = async (req, res) => {
    try {
        const [payments] = await db.query(
            `SELECT pay.*, p.address, p.unit_number
            FROM payments pay
            JOIN properties p ON p.id = pay.property_id
            WHERE pay.tenant_id = ?
            ORDER BY pay.created_at DESC`,
            [req.user.id]
        );

        res.json({ payments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SUBMIT MAINTENANCE REQUEST
const submitMaintenance = async (req, res) => {
    try {
        const { description, priority } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        // Get tenant property assignment
        const [assignments] = await db.query(
            'SELECT property_id FROM tenant_assignments WHERE tenant_id = ? AND is_active = 1',
            [req.user.id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ message: 'No active property assignment found' });
        }

        const property_id = assignments[0].property_id;

        const [result] = await db.query(
            'INSERT INTO maintenance_requests (tenant_id, property_id, description, priority) VALUES (?, ?, ?, ?)',
            [req.user.id, property_id, description, priority || 'medium']
        );

        res.status(201).json({
            message: 'Maintenance request submitted successfully',
            requestId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET TENANT MAINTENANCE REQUESTS
const getMaintenanceRequests = async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT mr.*, p.address, p.unit_number
            FROM maintenance_requests mr
            JOIN properties p ON p.id = mr.property_id
            WHERE mr.tenant_id = ?
            ORDER BY mr.created_at DESC`,
            [req.user.id]
        );

        res.json({ requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE TENANT PROFILE
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        await db.query(
            'UPDATE users SET name = ?, phone = ? WHERE id = ?',
            [name, phone, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ message: 'Both current and new password are required' });
        }

        // Get current password hash
        const [users] = await db.query(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(current_password, users[0].password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const new_hash = await bcrypt.hash(new_password, 10);

        await db.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [new_hash, req.user.id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    getPaymentHistory,
    submitMaintenance,
    getMaintenanceRequests,
    updateProfile,
    changePassword
};