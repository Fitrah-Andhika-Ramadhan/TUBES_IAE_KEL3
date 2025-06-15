const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.listAllUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await User.listAll({ page, limit });
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve users', details: error.message });
  }
};

exports.filterUsers = async (req, res) => {
  try {
    const result = await User.filter(req.query);
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Filter failed', details: error.message });
  }
};

exports.register = async (req, res) => {
  const { email, password, full_name, phone_number, birth_date = null, no_nik = null, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email is already registered' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      email, 
      password: hashedPassword, 
      full_name, phone_number, birth_date, no_nik,
      address, kelurahan, kecamatan, kabupaten_kota, province, postal_code,
      role: 'customer' // Default role
    };

    const result = await User.create(newUser);
    const createdUser = await User.getById(result.insertId);

    // Create JWT - In a real app, use a strong, secret key from environment variables
    const payload = { id: createdUser.id, role: createdUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('[Users Service] Generated Token:', token);

    // Exclude password from response
    const { password: _, ...userProfile } = createdUser;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: userProfile
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Registration failed', details: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing email or password' });
  }

  try {
    const user = await User.getByEmail(email);

    // Compare hashed password
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    // Create JWT - In a real app, use a strong, secret key from environment variables
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('[Users Service] Generated Token:', token);

    // Exclude password from response
    const { password: _, ...userProfile } = user;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: userProfile
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Login failed', details: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    // Exclude password from response
    const { password, ...userProfile } = user;
    res.status(200).json({ status: 'success', data: userProfile });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to get profile', details: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    // Ensure user exists before updating
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await User.update(id, req.body);
    const updatedUser = await User.getById(id);
    
    // Exclude password from response
    const { password, ...userProfile } = updatedUser;

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: userProfile
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Update failed', details: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.delete(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Delete failed', details: error.message });
  }
};
