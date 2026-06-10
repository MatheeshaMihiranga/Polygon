const pool = require('../config/database');

const TASK_JOIN = `
  SELECT t.*,
    u.name  AS assigned_to_name,  u.email AS assigned_to_email,
    c.name  AS created_by_name
  FROM tasks t
  LEFT JOIN users u ON t.assigned_to = u.id
  LEFT JOIN users c ON t.created_by  = c.id
`;

// ── GET /api/tasks ────────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (req.user.role === 'employee') {
      where += ' AND t.assigned_to = ?';
      params.push(req.user.id);
    }
    if (status)   { where += ' AND t.status = ?';   params.push(status); }
    if (priority) { where += ' AND t.priority = ?'; params.push(priority); }
    if (search)   {
      where += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [tasks] = await pool.execute(`${TASK_JOIN} ${where} ORDER BY t.created_at DESC`, params);
    res.json({ success: true, tasks });
  } catch (err) {
    console.error('getAllTasks error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /api/tasks/stats ──────────────────────────────────────
const getTaskStats = async (req, res) => {
  try {
    const params = [];
    let where = '';
    if (req.user.role === 'employee') {
      where = 'WHERE assigned_to = ?';
      params.push(req.user.id);
    }

    const [rows] = await pool.execute(
      `SELECT
        COUNT(*)                         AS total,
        SUM(status = 'pending')          AS pending,
        SUM(status = 'in_progress')      AS in_progress,
        SUM(status = 'completed')        AS completed
       FROM tasks ${where}`,
      params
    );
    res.json({ success: true, stats: rows[0] });
  } catch (err) {
    console.error('getTaskStats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── GET /api/tasks/:id ────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const [rows] = await pool.execute(`${TASK_JOIN} WHERE t.id = ?`, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = rows[0];
    if (req.user.role === 'employee' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, task });
  } catch (err) {
    console.error('getTaskById error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── POST /api/tasks ───────────────────────────────────────────
const createTask = async (req, res) => {
  const { title, description, priority, assigned_to, due_date } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description, priority, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [title.trim(), description || null, priority || 'medium', assigned_to || null, req.user.id, due_date || null]
    );

    const [rows] = await pool.execute(`${TASK_JOIN} WHERE t.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, message: 'Task created successfully', task: rows[0] });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── PUT /api/tasks/:id ────────────────────────────────────────
const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, priority, assigned_to, due_date } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const t = existing[0];

    if (req.user.role === 'employee') {
      if (t.assigned_to !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      // Employees may only update status
      if (status) {
        await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
      }
    } else {
      // Admins may update all fields
      await pool.execute(
        'UPDATE tasks SET title=?, description=?, status=?, priority=?, assigned_to=?, due_date=? WHERE id=?',
        [
          title       ?? t.title,
          description !== undefined ? description : t.description,
          status      ?? t.status,
          priority    ?? t.priority,
          assigned_to !== undefined ? assigned_to : t.assigned_to,
          due_date    !== undefined ? due_date    : t.due_date,
          taskId,
        ]
      );
    }

    const [rows] = await pool.execute(`${TASK_JOIN} WHERE t.id = ?`, [taskId]);
    res.json({ success: true, message: 'Task updated successfully', task: rows[0] });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT id FROM tasks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllTasks, getTaskStats, getTaskById, createTask, updateTask, deleteTask };
