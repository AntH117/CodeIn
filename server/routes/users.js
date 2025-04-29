const express = require('express');


const router = express.Router();

// Test route at /api/users
router.get('/', (req, res) => {
  res.send('Users route working!');
});

router.post('/register', (req, res) => {
    const {name, email, password} = req.body;

    res.json({
        message: 'User registered successfully',
        user: {
            name,
            email,
            password
        }
    })
})

module.exports = router