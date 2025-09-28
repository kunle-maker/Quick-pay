const API_BASE = '/api';

class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    async login(email, password) {  // Removed loginPin parameter
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })  // Only email and password
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error occurred' };
        }
    }

    async register(userData) {
        try {
            // Remove PIN fields from registration data
            const { loginPin, paymentPin, ...registrationData } = userData;
            
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData)  // Only basic info
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error occurred' };
        }
    }

    // Add method to check if user has set up PINs
    hasPinsSet() {
        return this.user && this.user.hasPinsSet;  // You'll need to add this field to your backend
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return !!this.token;
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }
}

const auth = new Auth();

// Login form handler (simplified)
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const loginText = document.getElementById('loginText');
        const loginSpinner = document.getElementById('loginSpinner');

        loginText.classList.add('hidden');
        loginSpinner.classList.remove('hidden');

        const result = await auth.login(email, password);

        if (result.success) {
            // Check if user needs to set up PINs
            if (!auth.hasPinsSet()) {
                window.location.href = 'profile.html?setup=pins';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            alert('Login failed: ' + result.error);
            loginText.classList.remove('hidden');
            loginSpinner.classList.add('hidden');
        }
    });
}

// Register form handler (simplified)
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value
            // Removed PIN fields
        };

        const registerText = document.getElementById('registerText');
        const registerSpinner = document.getElementById('registerSpinner');

        registerText.classList.add('hidden');
        registerSpinner.classList.remove('hidden');

        const result = await auth.register(formData);

        if (result.success) {
            // Redirect to profile for PIN setup
            window.location.href = 'profile.html?setup=pins';
        } else {
            alert('Registration failed: ' + result.error);
            registerText.classList.remove('hidden');
            registerSpinner.classList.add('hidden');
        }
    });
}

// Protect authenticated routes
if (window.location.pathname.includes('dashboard') || 
    window.location.pathname.includes('deposit') ||
    window.location.pathname.includes('transactions') ||
    window.location.pathname.includes('airtime') ||
    window.location.pathname.includes('data') ||
    window.location.pathname.includes('profile')) {
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Protect unauthenticated routes
if (window.location.pathname.includes('login') || 
    window.location.pathname.includes('register')) {
    
    if (auth.isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
    }
}

// Admin login functions
function showAdminLogin() {
    document.getElementById('adminForm').classList.toggle('hidden');
}

async function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin.html';
        } else {
            alert('Admin login failed: ' + data.error);
        }
    } catch (error) {
        alert('Network error occurred');
    }
}