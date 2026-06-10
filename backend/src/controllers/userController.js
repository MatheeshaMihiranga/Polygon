const bcrypt = require('bcryptjs');
const pool   = require('../config/database');

// ── GET /api/users/employees ──────────────────────────────────
const getAllEmployees = async (req, res) => {
  try {
    const [employees] = await pool.execute(`
      SELECT
        u.id, u.name, u.email, u.role, u.department, u.phone, u.created_at,
        COUNT(t.id)                      AS total_tasks,
        SUM(t.status = 'completed')      AS completed_tasks,
        SUM(t.status = 'in_progress')    AS in_progress_tasks,
        SUM(t.status = 'pending')        AS pending_tasks
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      WHERE u.role = 'employee'
      GROUP BY u.id
      ORDER BY u.name
    `);
    res.json({ success: true, employees });
  } catch (err) {
    console.error('getAllEmployees error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────
const getUserById = async (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  if (req.user.role === 'employee' && req.user.id !== targetId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, department, phone, created_at FROM users WHERE id = ?',
      [targetId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('getUserById error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── PUT /api/users/:id ────────────────────────────────────────
const updateUser = async (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  if (req.user.id !== targetId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const { name, phone, department, currentPassword, newPassword } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = existing[0];
    let query  = 'UPDATE users SET name = ?, phone = ?, department = ?';
    const params = [
      name       || user.name,
      phone      !== undefined ? phone       : user.phone,
      department !== undefined ? department  : user.department,
    ];

    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      query += ', password = ?';
      params.push(hashed);
    }

    query += ' WHERE id = ?';
    params.push(targetId);

    await pool.execute(query, params);

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, department, phone, created_at FROM users WHERE id = ?',
      [targetId]
    );
    res.json({ success: true, message: 'Profile updated successfully', user: rows[0] });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllEmployees, getUserById, updateUser };
