const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.FRONTEND_PORT || 3001;

// Allow requests from frontend to backend based on BACKEND_URL env
app.use(
  cors({
    origin: process.env.BACKEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static('public'));

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/pedir', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pedir.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend rodando em http://localhost:${PORT}`);
});
