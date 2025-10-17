const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Contact API is working!' 
  });
});

router.post('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Message received!' 
  });
});

module.exports = router;