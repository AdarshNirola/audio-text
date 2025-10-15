const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Session storage (in production, use Redis or database)
const activeSessions = new Map();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);
      
      // Store session
      activeSessions.set(user._id.toString(), {
        userId: user._id,
        email: user.email,
        name: user.name,
        loginTime: new Date()
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
        message: 'Registration successful!'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email });
    
    if (user && (await user.correctPassword(password, user.password))) {
      // Generate token
      const token = generateToken(user._id);
      
      // Store session
      activeSessions.set(user._id.toString(), {
        userId: user._id,
        email: user.email,
        name: user.name,
        loginTime: new Date()
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
        message: 'Login successful!'
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Logout Route
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Remove session
    activeSessions.delete(decoded.id);
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(400).json({ error: 'Logout failed' });
  }
});

// Get active sessions (admin feature)
router.get('/sessions', async (req, res) => {
  try {
    const sessions = Array.from(activeSessions.entries()).map(([userId, session]) => ({
      userId,
      ...session
    }));
    
    res.json({
      activeSessions: sessions,
      totalSessions: activeSessions.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Protected Route - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists
    const session = activeSessions.get(decoded.id);
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const user = await User.findById(decoded.id).select('-password');
    
    res.json({
      user,
      session: {
        loginTime: session.loginTime,
        sessionDuration: Date.now() - new Date(session.loginTime).getTime()
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
});

// Check session route
router.get('/check-session', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.json({ valid: false, message: 'No token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const session = activeSessions.get(decoded.id);
    
    if (session) {
      res.json({ 
        valid: true, 
        user: {
          _id: decoded.id,
          name: session.name,
          email: session.email
        },
        session: {
          loginTime: session.loginTime,
          sessionDuration: Date.now() - new Date(session.loginTime).getTime()
        }
      });
    } else {
      res.json({ valid: false, message: 'Session expired' });
    }
  } catch (error) {
    res.json({ valid: false, message: 'Invalid token' });
  }
});

module.exports = router;