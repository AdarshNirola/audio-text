const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('=== BACKEND STARTING ===');
console.log('PORT:', PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Missing');

// CRITICAL: Middleware MUST come BEFORE routes
app.use(cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
console.log('Attempting MongoDB connection...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Database name:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

// ROOT ROUTE - This is what you see in browser
app.get('/', (req, res) => {
  console.log('📥 GET / - Request received');
  console.log('From origin:', req.headers.origin);
  
  const response = {
    message: 'Hello from the backend!',
    timestamp: new Date().toISOString(),
    status: 'Backend is working!',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  console.log('📤 Sending response:', response);
  res.json(response);
});

// Test route
app.get('/api/test', (req, res) => {
  console.log('📥 GET /api/test - Request received');
  res.json({ message: 'API test route works!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for debugging
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('======================');
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ Also accessible at http://127.0.0.1:${PORT}`);
  console.log('======================');
});