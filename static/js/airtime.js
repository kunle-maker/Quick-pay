document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    updateBalance(auth.user.balance);
    initializeAirtimeForm();
});

function updateBalance(balance) {
    document.getElementById('currentBalance').textContent = `₦${balance?.toLocaleString() || '0.00'}`;
}

function initializeAirtimeForm() {
    // Network selection
    const networkRadios = document.querySelectorAll('input[name="network"]');
    networkRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateNetworkIcon(this.value);
        });
    });

    // Amount buttons
    const amountButtons = document.querySelectorAll('.amount-btn');
    amountButtons.forEach(button => {
        button.addEventListener('click', function() {
            amountButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('customAmount').value = this.dataset.amount;
        });
    });

    // Custom amount input
    document.getElementById('customAmount').addEventListener('input', function() {
        amountButtons.forEach(btn => btn.classList.remove('active'));
        validateAmount(this.value);
    });

    // Recipient input (validate phone number)
    document.getElementById('recipient').addEventListener('input', function() {
        validatePhoneNumber(this.value);
    });
}

function updateNetworkIcon(network) {
    const icon = document.getElementById('networkIcon');
    const networks = {
        'mtn': 'fas fa-sim-card',
        'glo': 'fas fa-sim-card',
        'airtel': 'fas fa-sim-card',
        '9mobile': 'fas fa-sim-card'
    };
    icon.className = networks[network] || 'fas fa-sim-card';
}

function validateAmount(amount) {
    const errorElement = document.getElementById('amountError');
    if (!amount || amount < 50) {
        errorElement.textContent = 'Amount must be at least ₦50';
        return false;
    }
    if (amount > 10000) {
        errorElement.textContent = 'Amount cannot exceed ₦10,000';
        return false;
    }
    errorElement.textContent = '';
    return true;
}

function validatePhoneNumber(phone) {
    const errorElement = document.getElementById('recipientError');
    const phoneRegex = /^(0[7-9][0-9]{9})$/;
    
    if (!phone) {
        errorElement.textContent = 'Phone number is required';
        return false;
    }
    if (!phoneRegex.test(phone)) {
        errorElement.textContent = 'Please enter a valid Nigerian phone number';
        return false;
    }
    errorElement.textContent = '';
    return true;
}

document.getElementById('airtimeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const network = document.querySelector('input[name="network"]:checked')?.value;
    const amount = document.getElementById('customAmount').value;
    const recipient = document.getElementById('recipient').value;
    const paymentPin = document.getElementById('paymentPin').value;

    // Validate inputs
    if (!network) {
        showError('Please select a network');
        return;
    }
    if (!validateAmount(amount)) return;
    if (!validatePhoneNumber(recipient)) return;
    if (!paymentPin || paymentPin.length !== 6) {
        showError('Please enter your 6-digit payment PIN');
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
        const response = await fetch(`${API_BASE}/airtime`, {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                amount: parseInt(amount),
                network,
                recipient,
                paymentPin
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess(`Airtime purchase successful! ${amount} airtime sent to ${recipient}`);
            document.getElementById('airtimeForm').reset();
            updateBalance(data.newBalance);
            
            // Reset amount buttons
            document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
        } else {
            showError('Purchase failed: ' + data.error);
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

// Quick select functions
function selectAmount(amount) {
    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('customAmount').value = amount;
}