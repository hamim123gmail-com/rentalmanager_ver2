# 🏢 RentManager - Rental Management System

A secure, web-based rental management platform with separate portals for Tenants and Property Owners.

---

## 📋 Features

### Owner Portal
- View all properties and tenants
- Add/edit properties
- Add tenants and assign them to properties
- View all payment records
- Approve/reject maintenance requests
- View financial reports

### Tenant Portal
- View rent status and due date
- View full payment history
- Submit and track maintenance requests
- Update profile and change password
- View landlord contact info

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | MySQL |
| Frontend | HTML + CSS + Bootstrap 5 |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |

---

## 📁 Project Structure
rental-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── ownerController.js
│   │   │   └── tenantController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── owner.js
│   │   │   └── tenant.js
│   │   └── app.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── api.js
│   ├── owner/
│   │   └── dashboard.html
│   ├── tenant/
│   │   └── dashboard.html
│   ├── index.html
│   └── login.html
├── database/
│   └── schema.sql
└── README.md

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8+
- VS Code (recommended)

### Step 1 — Clone or Download the Project
Place the project folder at your preferred location e.g. `D:\rental-management-system`

### Step 2 — Set Up the Database
1. Open MySQL Query Browser
2. Open and execute `database/schema.sql`
3. This creates the `rental_management` database with all tables and seed data

### Step 3 — Create a MySQL User
Run this in MySQL Query Browser:
```sql
CREATE USER 'rental_user'@'localhost' IDENTIFIED BY 'rental123';
GRANT ALL PRIVILEGES ON rental_management.* TO 'rental_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 4 — Configure Environment Variables
```bash
cd backend
copy .env.example .env
```
Edit `.env` with your actual values:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=rental_user
DB_PASSWORD=rental123
DB_NAME=rental_management
JWT_SECRET=rental_super_secret_key_2024
JWT_EXPIRES_IN=7d
```

### Step 5 — Install Dependencies
```bash
cd backend
npm install
```

### Step 6 — Start the Backend Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`

### Step 7 — Open the Frontend
1. Open VS Code
2. Install **Live Server** extension by Ritwick Dey
3. Right click `frontend/index.html`
4. Click **Open with Live Server**
5. App opens at `http://localhost:5500/frontend/index.html`

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | mary@example.com | password |
| Tenant | john@example.com | password |

---

## 🌐 API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get logged in user profile |

### Owner Routes (Protected)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/owner/properties | Get all properties |
| POST | /api/owner/properties | Add new property |
| PUT | /api/owner/properties/:id | Edit property |
| DELETE | /api/owner/properties/:id | Delete property |
| GET | /api/owner/tenants | Get all tenants |
| POST | /api/owner/tenants | Add new tenant |
| GET | /api/owner/payments | Get all payments |
| GET | /api/owner/maintenance | Get all maintenance requests |
| PUT | /api/owner/maintenance/:id | Update maintenance status |
| GET | /api/owner/reports | Get financial report |

### Tenant Routes (Protected)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/tenant/dashboard | Get dashboard info |
| GET | /api/tenant/payments | Get payment history |
| POST | /api/tenant/maintenance | Submit maintenance request |
| GET | /api/tenant/maintenance | Get maintenance requests |
| PUT | /api/tenant/profile | Update profile |
| PUT | /api/tenant/change-password | Change password |

---

## 🔒 Security Features

- JWT authentication on all protected routes
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Tenants cannot access owner routes
- Owners cannot access tenant routes
- SQL injection prevention via prepared statements

---

## 👨‍💻 Developer Notes

- Backend runs on port `5000`
- Frontend served via Live Server on port `5500`
- All amounts displayed in UGX (Ugandan Shillings)
- Passwords are hashed and never stored in plain text

---

## 📞 Support

For issues or questions contact the system administrator.
