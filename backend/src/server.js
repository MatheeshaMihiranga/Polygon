const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Employee Task Management API is running' });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
