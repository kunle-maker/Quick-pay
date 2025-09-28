document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        window.location.href = 'admin.html';
        return;
    }

    // Admin login form handler
    document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        const loginText = document.getElementById('loginText');
        const loginSpinner = document.getElementById('loginSpinner');

        loginText.classList.add('hidden');
        loginSpinner.classList.remove('hidden');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                showSuccess('Admin login successful! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                showError('Admin login failed: ' + data.error);
                loginText.classList.remove('hidden');
                loginSpinner.classList.add('hidden');
            }
        } catch (error) {
            showError('Network error occurred. Please try again.');
            loginText.classList.remove('hidden');
            loginSpinner.classList.add('hidden');
        }
    });
});

function showError(message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert error';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    const form = document.getElementById('adminLoginForm');
    form.parentNode.insertBefore(alertDiv, form);
}

function showSuccess(message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert success';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    const form = document.getElementById('adminLoginForm');
    form.parentNode.insertBefore(alertDiv, form);
}

// Enter key support
document.getElementById('adminPassword').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('adminLoginForm').dispatchEvent(new Event('submit'));
    }
});