const express = require('express');
const router = express.Router();

// GET для тестирования
router.get('/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin API is working!',
    endpoint: 'GET /api/admin/login' 
  });
});

// POST endpoint
router.post('/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login successful!',
    token: 'test-token-123'
  });
});

module.exports = router;