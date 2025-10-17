const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Projects API is working!',
    projects: []
  });
});

module.exports = router;