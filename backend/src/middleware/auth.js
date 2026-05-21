const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Check if user is owner
const isOwner = (req, res, next) => {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Access denied. Owners only.' });
    }
    next();
};

// Check if user is tenant
const isTenant = (req, res, next) => {
    if (req.user.role !== 'tenant') {
        return res.status(403).json({ message: 'Access denied. Tenants only.' });
    }
    next();
};

module.exports = { verifyToken, isOwner, isTenant };