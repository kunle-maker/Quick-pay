const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files properly
app.use('/css', express.static(path.join(__dirname, 'static/css')));
app.use('/js', express.static(path.join(__dirname, 'static/js')));
app.use('/images', express.static(path.join(__dirname, 'static/images')));

// API proxy to your backend (use environment variable for flexibility)
const BACKEND_URL = process.env.BACKEND_URL || 'http://164.92.186.219:1506';

app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Backend connection failed' });
    }
}));

// Serve HTML pages
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

app.get('/airtime', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'airtime.html'));
});

app.get('/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'data.html'));
});

app.get('/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'transactions.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'profile.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'admin.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

    setInterval(() => {  
  axios.get('https://quickpay-96ul.onrender.com').catch(() => {});  
}, 300000); // every 5 mins  
    
app.listen(PORT, () => {
    console.log(`🚀 Frontend server running on port ${PORT}`);
    console.log(`📡 Backend proxy: ${BACKEND_URL}`);
});