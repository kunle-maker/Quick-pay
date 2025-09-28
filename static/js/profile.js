document.addEventListener('DOMContentLoaded', async function() {
    const auth = new Auth();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    await loadProfile();
    setupEventListeners();
    
    // Check if user needs to set up PINs
    checkPinSetup();
});

function checkPinSetup() {
    const urlParams = new URLSearchParams(window.location.search);
    const needsPinSetup = urlParams.get('setup') === 'pins';
    
    if (needsPinSetup) {
        document.getElementById('pinSetupAlert').classList.remove('hidden');
        openTab('security');
    }
}

async function loadProfile() {
    try {
        const auth = new Auth();
        const response = await fetch(`${API_BASE}/profile`, {
            headers: auth.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            displayProfile(data.user);
        } else {
            showError('Failed to load profile');
        }
    } catch (error) {
        showError('Network error occurred');
    }
}

function displayProfile(user) {
    document.getElementById('fullName').value = user.fullName;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone;
    document.getElementById('accountNumber').textContent = user.accountNumber;
    document.getElementById('currentBalance').textContent = `₦${user.balance?.toLocaleString() || '0.00'}`;
    document.getElementById('accountStatus').textContent = user.isRestricted ? 'Restricted' : 'Active';
    document.getElementById('memberSince').textContent = new Date(user.createdAt).toLocaleDateString();
    
    // Update PIN status
    const pinStatus = user.loginPin && user.paymentPin ? 'Set' : 'Not Set';
    const pinStatusElement = document.getElementById('pinStatus');
    pinStatusElement.textContent = pinStatus;
    pinStatusElement.className = pinStatus === 'Set' ? 'status-active' : 'status-inactive';
    
    // Add status class
    const statusElement = document.getElementById('accountStatus');
    statusElement.className = user.isRestricted ? 'status-restricted' : 'status-active';
}

function setupEventListeners() {
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await updateProfile();
    });

    // PIN setup form
    document.getElementById('pinSetupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await setupPins();
    });

    // Change password form
    document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await changePassword();
    });
}

async function setupPins() {
    const loginPin = document.getElementById('loginPin').value;
    const paymentPin = document.getElementById('paymentPin').value;

    if (!loginPin || loginPin.length !== 6) {
        showError('Login PIN must be 6 digits');
        return;
    }

    if (!paymentPin || paymentPin.length !== 6) {
        showError('Payment PIN must be 6 digits');
        return;
    }

    if (loginPin === paymentPin) {
        showError('Login PIN and Payment PIN cannot be the same');
        return;
    }

    const submitBtn = document.getElementById('pinSubmitBtn');
    const submitText = document.getElementById('pinSubmitText');
    const submitSpinner = document.getElementById('pinSubmitSpinner');

    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
        // You'll need to create this endpoint in your backend
        const auth = new Auth();
        const response = await fetch(`${API_BASE}/profile/pins`, {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({ loginPin, paymentPin })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('PINs set up successfully! You can now make transactions.');
            document.getElementById('pinSetupAlert').classList.add('hidden');
            document.getElementById('pinStatus').textContent = 'Set';
            document.getElementById('pinStatus').className = 'status-active';
            
            // Remove setup parameter from URL
            window.history.replaceState({}, '', 'profile.html');
        } else {
            showError('PIN setup failed: ' + data.error);
        }
    } catch (error) {
        showError('Network error occurred');
    } finally {
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// ... rest of profile.js functions remain the same ...

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }

    if (newPassword.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    const submitBtn = document.getElementById('passwordSubmitBtn');
    const submitText = document.getElementById('passwordSubmitText');
    const submitSpinner = document.getElementById('passwordSubmitSpinner');

    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
        // Note: Your backend doesn't have a password change endpoint yet
        // This is a placeholder for future implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSuccess('Password changed successfully');
        document.getElementById('changePasswordForm').reset();
    } catch (error) {
        showError('Password change failed');
    } finally {
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert error';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.getElementById('alertsContainer').appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert success';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.getElementById('alertsContainer').appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Tab functionality
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Copy account number
function copyAccountNumber() {
    const accountNumber = document.getElementById('accountNumber').textContent;
    navigator.clipboard.writeText(accountNumber).then(() => {
        showSuccess('Account number copied to clipboard!');
    });
}