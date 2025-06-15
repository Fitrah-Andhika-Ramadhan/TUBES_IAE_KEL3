const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// List all users
router.get('/', userController.listAllUsers);

// Filter users with multiple criteria
router.get('/filter', userController.filterUsers);

// Register
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Get profile - must be after other GET routes with specific paths
router.get('/:id', userController.getProfile);

// Update profile
router.put('/:id', userController.updateProfile);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
