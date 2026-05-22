// ============================================
// API HELPER - Connects Frontend to Backend
// ============================================

const API_URL = 'https://rentalmanagerver2-production.up.railway.app/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Get logged in user
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

// Save login data
const saveAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Clear login data
const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Check if logged in
const isLoggedIn = () => !!getToken();

// Redirect if not logged in
const requireAuth = (role) => {
    if (!isLoggedIn()) {
        window.location.href = '/frontend/login.html?role=' + role;
        return false;
    }
    const user = getUser();
    if (user.role !== role) {
        window.location.href = '/frontend/login.html?role=' + role;
        return false;
    }
    return true;
};

// API Request helper
const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
};

// AUTH
const authAPI = {
    login: (email, password, role) => apiRequest('/auth/login', 'POST', { email, password, role }),
    register: (data) => apiRequest('/auth/register', 'POST', data),
    profile: () => apiRequest('/auth/profile')
};

// OWNER
const ownerAPI = {
    getProperties: () => apiRequest('/owner/properties'),
    addProperty: (data) => apiRequest('/owner/properties', 'POST', data),
    editProperty: (id, data) => apiRequest(`/owner/properties/${id}`, 'PUT', data),
    deleteProperty: (id) => apiRequest(`/owner/properties/${id}`, 'DELETE'),
    getTenants: () => apiRequest('/owner/tenants'),
    addTenant: (data) => apiRequest('/owner/tenants', 'POST', data),
    getPayments: () => apiRequest('/owner/payments'),
    recordPayment: (data) => apiRequest('/owner/payments', 'POST', data),
    updatePayment: (id, data) => apiRequest(`/owner/payments/${id}`, 'PUT', data),
    deactivateTenant: (id) => apiRequest(`/owner/tenants/${id}/deactivate`, 'PUT'),
    getMaintenance: () => apiRequest('/owner/maintenance'),
    updateMaintenance: (id, data) => apiRequest(`/owner/maintenance/${id}`, 'PUT', data),
    getReports: (month, year) => apiRequest(`/owner/reports?month=${month}&year=${year}`)
};

// TENANT
const tenantAPI = {
    getDashboard: () => apiRequest('/tenant/dashboard'),
    getPayments: () => apiRequest('/tenant/payments'),
    submitMaintenance: (data) => apiRequest('/tenant/maintenance', 'POST', data),
    getMaintenance: () => apiRequest('/tenant/maintenance'),
    updateProfile: (data) => apiRequest('/tenant/profile', 'PUT', data),
    changePassword: (data) => apiRequest('/tenant/change-password', 'PUT', data)
};

// Show alert message
const showAlert = (message, type = 'success', containerId = 'alert-container') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => container.innerHTML = '', 4000);
};

// Format currency
const formatCurrency = (amount) => {
    return 'UGX ' + parseFloat(amount).toLocaleString();
};

// Format date
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-UG', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

// Get status badge color
const getStatusBadge = (status) => {
    const colors = {
        'paid': 'success',
        'pending': 'warning',
        'overdue': 'danger',
        'resolved': 'success',
        'in_progress': 'info',
        'rejected': 'danger',
        'low': 'success',
        'medium': 'warning',
        'high': 'danger'
    };
    return colors[status] || 'secondary';
};