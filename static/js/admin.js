document.addEventListener('DOMContentLoaded', function() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'login.html';
        return;
    }

    loadAdminDashboard();
    setupAdminEventListeners();
});

async function loadAdminDashboard() {
    await loadStats();
    await loadPendingPayments();
    await loadUsers();
}

async function loadStats() {
    try {
        const usersResponse = await fetch(`${API_BASE}/admin/users`);
        const users = await usersResponse.json();
        
        const paymentsResponse = await fetch(`${API_BASE}/admin/payments`);
        const payments = await paymentsResponse.json();

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('pendingPayments').textContent = payments.length;
        document.getElementById('totalBalance').textContent = `₦${users.reduce((sum, user) => sum + user.balance, 0).toLocaleString()}`;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadPendingPayments() {
    try {
        const response = await fetch(`${API_BASE}/admin/payments`);
        const payments = await response.json();
        displayPendingPayments(payments);
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayPendingPayments(payments) {
    const container = document.getElementById('pendingPaymentsList');
    
    if (payments.length === 0) {
        container.innerHTML = '<div class="no-data">No pending payments</div>';
        return;
    }

    container.innerHTML = payments.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <h4>₦${payment.amount.toLocaleString()} Deposit</h4>
                <p>From: ${payment.senderAccountName}</p>
                <p>User: ${payment.user?.fullName} (${payment.user?.accountNumber})</p>
                <small>Submitted: ${new Date(payment.timestamp).toLocaleString()}</small>
            </div>
            <div class="payment-actions">
                <button onclick="approvePayment('${payment.id}')" class="btn-success">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button onclick="showRejectForm('${payment.id}')" class="btn-danger">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    
    container.innerHTML = users.map(user => `
        <div class="user-item ${user.isRestricted ? 'restricted' : ''}">
            <div class="user-info">
                <h4>${user.fullName}</h4>
                <p>${user.email} • ${user.phone}</p>
                <p>Account: ${user.accountNumber} • Balance: ₦${user.balance.toLocaleString()}</p>
                <p>Joined: ${new Date(user.createdAt).toLocaleDateString()}</p>
                <p>Warnings: ${user.warnings} • Status: 
                    <span class="status-${user.isRestricted ? 'restricted' : 'active'}">
                        ${user.isRestricted ? 'Restricted' : 'Active'}
                    </span>
                </p>
            </div>
            <div class="user-actions">
                <button onclick="viewUserTransactions('${user.id}')" class="btn-primary">
                    <i class="fas fa-history"></i> Transactions
                </button>
                <div class="dropdown">
                    <button class="btn-secondary dropdown-toggle">
                        <i class="fas fa-cog"></i> Manage
                    </button>
                    <div class="dropdown-menu">
                        <a href="#" onclick="manageUser('${user.id}', 'warn')">Issue Warning</a>
                        <a href="#" onclick="manageUser('${user.id}', 'restrict')">Restrict Account</a>
                        <a href="#" onclick="manageUser('${user.id}', 'unrestrict')">Unrestrict Account</a>
                        <a href="#" onclick="manageUser('${user.id}', 'delete')" class="danger">Delete User</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function approvePayment(verificationId) {
    if (!confirm('Are you sure you want to approve this payment?')) return;

    try {
        const response = await fetch(`${API_BASE}/admin/payments/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ verificationId })
        });

        if (response.ok) {
            showSuccess('Payment approved successfully');
            loadAdminDashboard();
        } else {
            const data = await response.json();
            showError('Approval failed: ' + data.error);
        }
    } catch (error) {
        showError('Network error occurred');
    }
}

function showRejectForm(verificationId) {
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
        rejectPayment(verificationId, reason);
    }
}

async function rejectPayment(verificationId, reason) {
    try {
        const response = await fetch(`${API_BASE}/admin/payments/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ verificationId, adminNotes: reason })
        });

        if (response.ok) {
            showSuccess('Payment rejected successfully');
            loadAdminDashboard();
        } else {
            const data = await response.json();
            showError('Rejection failed: ' + data.error);
        }
    } catch (error) {
        showError('Network error occurred');
    }
}

async function viewUserTransactions(userId) {
    try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}/transactions`);
        const transactions = await response.json();
        showTransactionsModal(transactions);
    } catch (error) {
        showError('Error loading transactions');
    }
}

function showTransactionsModal(transactions) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>User Transactions</h3>
                <button onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                ${transactions.length === 0 ? '<p>No transactions found</p>' : `
                    <div class="transactions-list">
                        ${transactions.map(t => `
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <h4>${t.description}</h4>
                                    <p>${new Date(t.timestamp).toLocaleString()} • ${t.status}</p>
                                </div>
                                <div class="transaction-amount ${t.type === 'deposit' ? 'amount-positive' : 'amount-negative'}">
                                    ${t.type === 'deposit' ? '+' : '-'}₦${t.amount.toLocaleString()}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function manageUser(userId, action) {
    const actions = {
        'warn': 'issue a warning',
        'restrict': 'restrict this account',
        'unrestrict': 'unrestrict this account',
        'delete': 'delete this user'
    };

    if (!confirm(`Are you sure you want to ${actions[action]}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/admin/users/manage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                userId, 
                action,
                reason: prompt('Enter reason:') || 'No reason provided'
            })
        });

        if (response.ok) {
            showSuccess(`User ${action}ed successfully`);
            loadAdminDashboard();
        } else {
            const data = await response.json();
            showError('Action failed: ' + data.error);
        }
    } catch (error) {
        showError('Network error occurred');
    }
}

function setupAdminEventListeners() {
    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });
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

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    }
}