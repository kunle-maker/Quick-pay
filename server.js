const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('static'));

// API proxy to your backend
app.use('/api', require('http-proxy-middleware').createProxyMiddleware({
    target: 'http://164.92.186.219:1506',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    }
}));

// Serve frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'register.html'));
});

app.get('/adminlogin', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'adminlogin.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'dashboard.html'));
});

app.get('/deposit', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'deposit.html'));
});

app.get('/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'transactions.html'));
});

app.get('/airtime', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'airtime.html'));
});

app.get('/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'data.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'profile.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});