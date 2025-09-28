document.addEventListener('DOMContentLoaded', async function() {
    const auth = new Auth();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Load deposit account
    await loadDepositAccount();
    
    // Update user balance
    updateBalance(auth.user.balance);
});

async function loadDepositAccount() {
    try {
        const auth = new Auth();
        const response = await fetch(`${API_BASE}/deposit/account`, {
            headers: auth.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            displayDepositAccount(data.depositAccount);
        } else {
            showError('Failed to load deposit account');
        }
    } catch (error) {
        showError('Network error occurred');
    }
}

function displayDepositAccount(account) {
    document.getElementById('accountNumber').textContent = account.accountNumber;
    document.getElementById('accountName').textContent = account.accountName;
    document.getElementById('bankName').textContent = account.bank;
    document.getElementById('expiryTime').textContent = account.expiresIn + ' minutes';
    
    // Set expiry timer
    startExpiryTimer(account.expiresIn);
}

function startExpiryTimer(minutes) {
    let seconds = minutes * 60;
    const timerElement = document.getElementById('expiryTimer');
    
    const timer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(timer);
            timerElement.innerHTML = '<span style="color: #ef4444;">Expired! Refresh to get new account</span>';
            return;
        }
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function updateBalance(balance) {
    document.getElementById('currentBalance').textContent = `₦${balance?.toLocaleString() || '0.00'}`;
}

document.getElementById('verifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const amount = document.getElementById('amount').value;
    const senderAccountName = document.getElementById('senderAccountName').value;
    
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    if (!senderAccountName) {
        showError('Please enter sender account name');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');

    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
        const auth = new Auth();
        const response = await fetch(`${API_BASE}/deposit/verify`, {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({ amount: parseInt(amount), senderAccountName })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Deposit verification submitted! Admin will review shortly.');
            document.getElementById('verifyForm').reset();
        } else {
            showError('Submission failed: ' + data.error);
        }
    } catch (error) {
        showError('Network error occurred');
    } finally {
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
});

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

function copyAccountNumber() {
    const accountNumber = document.getElementById('accountNumber').textContent;
    navigator.clipboard.writeText(accountNumber).then(() => {
        showSuccess('Account number copied to clipboard!');
    });
}

function copyAccountName() {
    const accountName = document.getElementById('accountName').textContent;
    navigator.clipboard.writeText(accountName).then(() => {
        showSuccess('Account name copied to clipboard!');
    });
}