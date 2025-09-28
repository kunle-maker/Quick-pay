document.addEventListener('DOMContentLoaded', async function() {
    const auth = new Auth();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    await loadTransactions();
});

async function loadTransactions() {
    try {
        showLoading();
        const auth = new Auth();
        const response = await fetch(`${API_BASE}/transactions`, {
            headers: auth.getAuthHeaders()
        });

        if (response.ok) {
            const transactions = await response.json();
            displayTransactions(transactions);
        } else {
            showError('Failed to load transactions');
        }
    } catch (error) {
        showError('Network error occurred');
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsContainer');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-receipt"></i>
                <h3>No transactions yet</h3>
                <p>Your transactions will appear here</p>
            </div>
        `;
        return;
    }

    const transactionsByDate = groupTransactionsByDate(transactions);
    
    container.innerHTML = Object.keys(transactionsByDate).map(date => `
        <div class="transaction-day-group">
            <h3 class="date-header">${formatDateHeader(date)}</h3>
            <div class="transactions-list">
                ${transactionsByDate[date].map(transaction => `
                    <div class="transaction-item">
                        <div class="transaction-icon">
                            ${getTransactionIcon(transaction.type)}
                        </div>
                        <div class="transaction-details">
                            <h4>${transaction.description}</h4>
                            <p>${formatTransactionTime(transaction.timestamp)} • 
                               <span class="status-${transaction.status}">${transaction.status}</span></p>
                            ${transaction.recipient ? `<p class="recipient">To: ${transaction.recipient}</p>` : ''}
                            ${transaction.depositFromAccount ? `<p class="sender">From: ${transaction.depositFromAccount}</p>` : ''}
                        </div>
                        <div class="transaction-amount ${getAmountClass(transaction)}">
                            ${getAmountPrefix(transaction)}₦${transaction.amount.toLocaleString()}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function groupTransactionsByDate(transactions) {
    return transactions.reduce((groups, transaction) => {
        const date = new Date(transaction.timestamp).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});
}

function formatDateHeader(dateString) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    
    return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTransactionTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function getTransactionIcon(type) {
    const icons = {
        'deposit': 'fas fa-arrow-down',
        'airtime': 'fas fa-mobile-alt',
        'data': 'fas fa-wifi',
        'transfer': 'fas fa-exchange-alt'
    };
    return `<i class="${icons[type] || 'fas fa-exchange-alt'}"></i>`;
}

function getAmountClass(transaction) {
    if (transaction.type === 'deposit') return 'amount-positive';
    return 'amount-negative';
}

function getAmountPrefix(transaction) {
    if (transaction.type === 'deposit') return '+';
    return '-';
}

function showLoading() {
    document.getElementById('transactionsContainer').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading transactions...</p>
        </div>
    `;
}

function showError(message) {
    document.getElementById('transactionsContainer').innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Unable to load transactions</h3>
            <p>${message}</p>
            <button onclick="loadTransactions()" class="btn-primary">Try Again</button>
        </div>
    `;
}

// Filter transactions
function filterTransactions(type) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // In a real implementation, you would filter the transactions array
    // For now, we'll just reload all transactions
    loadTransactions();
}