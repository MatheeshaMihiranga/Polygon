const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/database');

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, password, role, department, phone FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _pw, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /api/auth/profile ─────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, department, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { login, getProfile };
