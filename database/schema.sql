-- ============================================
-- RENTAL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================

CREATE DATABASE IF NOT EXISTS rental_management;
USE rental_management;

-- 1. USERS TABLE (both tenants and owners)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('tenant', 'owner', 'admin') NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    unit_number VARCHAR(50),
    rent_amount DECIMAL(10,2) NOT NULL,
    due_date INT NOT NULL COMMENT 'Day of month rent is due (e.g. 1-31)',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. TENANT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS tenant_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    lease_start DATE NOT NULL,
    lease_end DATE,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
    receipt_url VARCHAR(255),
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 5. MAINTENANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
    owner_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 6. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('rent_due', 'lease_expiry', 'overdue_rent') NOT NULL,
    message TEXT,
    scheduled_date DATE NOT NULL,
    sent TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA (Test Accounts)
-- ============================================

-- Owner account: mary@example.com / owner123
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Hamim Swaib', 'mary@example.com', '0700000001',
'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner');

-- Tenant account: john@example.com / tenant123
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Amir Swaib', 'john@example.com', '0700000002',
'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tenant');

-- Sample property owned by Mary (owner id=1)
INSERT INTO properties (owner_id, address, unit_number, rent_amount, due_date) VALUES
(1, '45 Kampala Road, Nakasero', 'Unit 3A', 850000.00, 5);

-- Assign John to the property
INSERT INTO tenant_assignments (tenant_id, property_id, lease_start, lease_end) VALUES
(2, 1, '2025-01-01', '2026-01-01');

-- Sample payment records for John
INSERT INTO payments (tenant_id, property_id, amount, status, payment_date) VALUES
(2, 1, 850000.00, 'paid', '2025-01-04'),
(2, 1, 850000.00, 'paid', '2025-02-03'),
(2, 1, 850000.00, 'pending', NULL);

-- Sample maintenance request from John
INSERT INTO maintenance_requests (tenant_id, property_id, description, priority, status) VALUES
(2, 1, 'Kitchen sink is leaking and causing water damage to the cabinet below.', 'high', 'pending');

SHOW DATABASES;
