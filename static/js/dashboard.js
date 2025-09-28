// Dashboard functionality
document.addEventListener('DOMContentLoaded', async function() {
    const auth = new Auth();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Update user info
    document.getElementById('userName').textContent = auth.user.fullName;
    document.getElementById('welcomeName').textContent = auth.user.fullName;
    document.getElementById('balanceAmount').textContent = `₦${auth.user.balance?.toLocaleString() || '0.00'}`;
    document.getElementById('accountNumber').textContent = auth.user.accountNumber;

    // Load transactions
    await loadRecentTransactions();
});

async function loadRecentTransactions() {
    try {
        const auth = new Auth();
        const response = await fetch(`${API_BASE}/transactions`, {
            headers: auth.getAuthHeaders()
        });

        if (response.ok) {
            const transactions = await response.json();
            displayTransactions(transactions.slice(0, 5)); // Show last 5
        } else {
            document.getElementById('transactionsList').innerHTML = 
                '<div class="error">Failed to load transactions</div>';
        }
    } catch (error) {
        document.getElementById('transactionsList').innerHTML = 
            '<div class="error">Network error occurred</div>';
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="no-data">No transactions found</div>';
        return;
    }

    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p>${new Date(transaction.timestamp).toLocaleDateString()} • ${transaction.status}</p>
            </div>
            <div class="transaction-amount ${transaction.type === 'deposit' ? 'amount-positive' : 'amount-negative'}">
                ${transaction.type === 'deposit' ? '+' : '-'}₦${transaction.amount.toLocaleString()}
            </div>
        </div>
    `).join('');
}

function toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('hidden');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const userBtn = document.querySelector('.user-btn');
    
    if (dropdown && !dropdown.contains(event.target) && !userBtn.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});