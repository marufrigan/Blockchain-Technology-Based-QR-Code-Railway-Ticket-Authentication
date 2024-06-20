const express = require('express');
const path = require('path');
const app = express();
const port = 8001;

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Route for the admin login page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

// Route for the admin dashboard page
app.get('/admin_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'admin_dashboard.html'));
});

// Route for the customer login page
app.get('/customer_login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'customer_login.html'));
});

// Route for the customer verification page
app.get('/customer_verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'customer_verify.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
