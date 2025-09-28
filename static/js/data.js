document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    updateBalance(auth.user.balance);
    initializeDataForm();
    loadDataPlans();
});

function updateBalance(balance) {
    document.getElementById('currentBalance').textContent = `₦${balance?.toLocaleString() || '0.00'}`;
}

function initializeDataForm() {
    // Network selection
    const networkRadios = document.querySelectorAll('input[name="network"]');
    networkRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateNetworkIcon(this.value);
            loadDataPlans(this.value);
        });
    });

    // Recipient input validation
    document.getElementById('recipient').addEventListener('input', function() {
        validatePhoneNumber(this.value);
    });
}

function updateNetworkIcon(network) {
    const icon = document.getElementById('networkIcon');
    const networks = {
        'mtn': 'fas fa-wifi',
        'glo': 'fas fa-wifi',
        'airtel': 'fas fa-wifi',
        '9mobile': 'fas fa-wifi'
    };
    icon.className = networks[network] || 'fas fa-wifi';
}

function loadDataPlans(network) {
    const plansContainer = document.getElementById('dataPlans');
    
    // Mock data plans - in real implementation, you'd fetch from API
    const dataPlans = {
        mtn: [
            { name: '500MB', validity: '30 days', price: 200 },
            { name: '1GB', validity: '30 days', price: 350 },
            { name: '2GB', validity: '30 days', price: 600 },
            { name: '5GB', validity: '30 days', price: 1500 }
        ],
        airtel: [
            { name: '500MB', validity: '30 days', price: 200 },
            { name: '1GB', validity: '30 days', price: 350 },
            { name: '2GB', validity: '30 days', price: 600 },
            { name: '5GB', validity: '30 days', price: 1500 }
        ],
        glo: [
            { name: '500MB', validity: '30 days', price: 200 },
            { name: '1GB', validity: '30 days', price: 350 },
            { name: '2GB', validity: '30 days', price: 600 },
            { name: '5GB', validity: '30 days', price: 1500 }
        ],
        '9mobile': [
            { name: '500MB', validity: '30 days', price: 200 },
            { name: '1GB', validity: '30 days', price: 350 },
            { name: '2GB', validity: '30 days', price: 600 },
            { name: '5GB', validity: '30 days', price: 1500 }
        ]
    };

    const plans = dataPlans[network] || [];
    
    if (plans.length === 0) {
        plansContainer.innerHTML = '<div class="no-plans">No data plans available for this network</div>';
        return;
    }

    plansContainer.innerHTML = plans.map(plan => `
        <div class="data-plan" onclick="selectDataPlan('${plan.name}', ${plan.price})">
            <div class="plan-info">
                <h4>${plan.name}</h4>
                <p>${plan.validity}</p>
            </div>
            <div class="plan-price">₦${plan.price}</div>
        </div>
    `).join('');
}

function selectDataPlan(planName, price) {
    // Remove active class from all plans
    document.querySelectorAll('.data-plan').forEach(plan => {
        plan.classList.remove('active');
    });
    
    // Add active class to selected plan
    event.currentTarget.classList.add('active');
    
    // Update form fields
    document.getElementById('dataPlan').value = planName;
    document.getElementById('amount').value = price;
    
    // Show selected plan summary
    document.getElementById('selectedPlan').innerHTML = `
        <strong>Selected:</strong> ${planName} - ₦${price}
    `;
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

document.getElementById('dataForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const network = document.querySelector('input[name="network"]:checked')?.value;
    const dataPlan = document.getElementById('dataPlan').value;
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;
    const paymentPin = document.getElementById('paymentPin').value;

    // Validate inputs
    if (!network) {
        showError('Please select a network');
        return;
    }
    if (!dataPlan) {
        showError('Please select a data plan');
        return;
    }
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
        const response = await fetch(`${API_BASE}/data`, {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                dataPlan,
                network,
                recipient,
                amount: parseInt(amount),
                paymentPin
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess(`Data purchase successful! ${dataPlan} data sent to ${recipient}`);
            document.getElementById('dataForm').reset();
            document.getElementById('selectedPlan').innerHTML = '';
            updateBalance(data.newBalance);
            
            // Reset selected plan
            document.querySelectorAll('.data-plan').forEach(plan => {
                plan.classList.remove('active');
            });
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