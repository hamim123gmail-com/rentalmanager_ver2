const db = require('../config/db');

// GET ALL PROPERTIES FOR OWNER
const getProperties = async (req, res) => {
    try {
        const [properties] = await db.query(
            `SELECT p.*, 
            (SELECT COUNT(*) FROM tenant_assignments ta WHERE ta.property_id = p.id AND ta.is_active = 1) as tenant_count
            FROM properties p 
            WHERE p.owner_id = ? AND p.is_active = 1`,
            [req.user.id]
        );
        res.json({ properties });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD NEW PROPERTY
const addProperty = async (req, res) => {
    try {
        const { address, unit_number, rent_amount, due_date } = req.body;

        if (!address || !rent_amount || !due_date) {
            return res.status(400).json({ message: 'Address, rent amount and due date are required' });
        }

        const [result] = await db.query(
            'INSERT INTO properties (owner_id, address, unit_number, rent_amount, due_date) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, address, unit_number, rent_amount, due_date]
        );

        res.status(201).json({ message: 'Property added successfully', propertyId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// EDIT PROPERTY
const editProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { address, unit_number, rent_amount, due_date } = req.body;

        const [result] = await db.query(
            `UPDATE properties SET address = ?, unit_number = ?, rent_amount = ?, due_date = ? 
            WHERE id = ? AND owner_id = ?`,
            [address, unit_number, rent_amount, due_date, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }

        res.json({ message: 'Property updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE PROPERTY
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE properties SET is_active = 0 WHERE id = ? AND owner_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL TENANTS FOR OWNER
const getTenants = async (req, res) => {
    try {
        const [tenants] = await db.query(
            `SELECT u.id, u.name, u.email, u.phone,p.id as property_id,
            p.address, p.unit_number, p.rent_amount, p.due_date,
            ta.lease_start, ta.lease_end,
            (SELECT status FROM payments WHERE tenant_id = u.id ORDER BY created_at DESC LIMIT 1) as last_payment_status
            FROM users u
            JOIN tenant_assignments ta ON ta.tenant_id = u.id
            JOIN properties p ON p.id = ta.property_id
            WHERE p.owner_id = ? AND ta.is_active = 1 AND u.is_active = 1`,
            [req.user.id]
        );
        res.json({ tenants });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD TENANT TO PROPERTY
const addTenant = async (req, res) => {
    try {
        const { name, email, phone, password, property_id, lease_start, lease_end } = req.body;

        if (!name || !email || !password || !property_id || !lease_start) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check property belongs to owner
        const [properties] = await db.query(
            'SELECT id FROM properties WHERE id = ? AND owner_id = ?',
            [property_id, req.user.id]
        );

        if (properties.length === 0) {
            return res.status(403).json({ message: 'Property not found or unauthorized' });
        }

        // Check if email exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ?', [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(password, 10);

        // Create tenant user
        const [userResult] = await db.query(
            'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, password_hash, 'tenant']
        );

        // Assign tenant to property
        await db.query(
            'INSERT INTO tenant_assignments (tenant_id, property_id, lease_start, lease_end) VALUES (?, ?, ?, ?)',
            [userResult.insertId, property_id, lease_start, lease_end]
        );

        res.status(201).json({ message: 'Tenant added successfully', tenantId: userResult.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL PAYMENTS FOR OWNER
const getPayments = async (req, res) => {
    try {
        const [payments] = await db.query(
            `SELECT pay.*, u.name as tenant_name, u.email as tenant_email,
            p.address, p.unit_number
            FROM payments pay
            JOIN users u ON u.id = pay.tenant_id
            JOIN properties p ON p.id = pay.property_id
            WHERE p.owner_id = ?
            ORDER BY pay.created_at DESC`,
            [req.user.id]
        );
        res.json({ payments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL MAINTENANCE REQUESTS FOR OWNER
const getMaintenanceRequests = async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT mr.*, u.name as tenant_name, u.email as tenant_email,
            p.address, p.unit_number
            FROM maintenance_requests mr
            JOIN users u ON u.id = mr.tenant_id
            JOIN properties p ON p.id = mr.property_id
            WHERE p.owner_id = ?
            ORDER BY mr.created_at DESC`,
            [req.user.id]
        );
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE MAINTENANCE REQUEST STATUS
const updateMaintenanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, owner_notes } = req.body;

        if (!['pending', 'in_progress', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await db.query(
            `UPDATE maintenance_requests mr
            JOIN properties p ON p.id = mr.property_id
            SET mr.status = ?, mr.owner_notes = ?
            WHERE mr.id = ? AND p.owner_id = ?`,
            [status, owner_notes, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found or unauthorized' });
        }

        res.json({ message: 'Maintenance request updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET FINANCIAL REPORT
const getFinancialReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        let query = `
            SELECT 
                SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END) as total_collected,
                SUM(CASE WHEN pay.status = 'pending' THEN pay.amount ELSE 0 END) as total_pending,
                SUM(CASE WHEN pay.status = 'overdue' THEN pay.amount ELSE 0 END) as total_overdue,
                COUNT(CASE WHEN pay.status = 'paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN pay.status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN pay.status = 'overdue' THEN 1 END) as overdue_count
            FROM payments pay
            JOIN properties p ON p.id = pay.property_id
            WHERE p.owner_id = ?
        `;

        const params = [req.user.id];

        if (month && year) {
            query += ' AND MONTH(pay.created_at) = ? AND YEAR(pay.created_at) = ?';
            params.push(month, year);
        }

        const [report] = await db.query(query, params);
        res.json({ report: report[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// RECORD PAYMENT
const recordPayment = async (req, res) => {
    try {
        const { tenant_id, property_id, amount, status, payment_date } = req.body;

        if (!tenant_id || !property_id || !amount || !status) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify property belongs to owner
        const [properties] = await db.query(
            'SELECT id FROM properties WHERE id = ? AND owner_id = ?',
            [property_id, req.user.id]
        );

        if (properties.length === 0) {
            return res.status(403).json({ message: 'Property not found or unauthorized' });
        }

        // Record the payment
        const [result] = await db.query(
            `INSERT INTO payments (tenant_id, property_id, amount, status, payment_date) 
            VALUES (?, ?, ?, ?, ?)`,
            [tenant_id, property_id, amount, status, payment_date || null]
        );

        res.status(201).json({
            message: 'Payment recorded successfully',
            paymentId: result.insertId
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE PAYMENT STATUS
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_date } = req.body;

        if (!['paid', 'pending', 'overdue'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await db.query(
            `UPDATE payments pay
            JOIN properties p ON p.id = pay.property_id
            SET pay.status = ?, pay.payment_date = ?
            WHERE pay.id = ? AND p.owner_id = ?`,
            [status, payment_date || null, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment not found or unauthorized' });
        }

        res.json({ message: 'Payment updated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DEACTIVATE TENANT
const deactivateTenant = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify tenant belongs to owner
        const [tenants] = await db.query(
            `SELECT ta.id FROM tenant_assignments ta
            JOIN properties p ON p.id = ta.property_id
            WHERE ta.tenant_id = ? AND p.owner_id = ? AND ta.is_active = 1`,
            [id, req.user.id]
        );

        if (tenants.length === 0) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }

        // Deactivate tenant assignment (property becomes vacant)
        await db.query(
            `UPDATE tenant_assignments SET is_active = 0 
            WHERE tenant_id = ? AND is_active = 1`,
            [id]
        );

        // Deactivate tenant account
        await db.query(
            'UPDATE users SET is_active = 0 WHERE id = ?',
            [id]
        );

        res.json({ message: 'Tenant deactivated successfully. Property is now vacant.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};