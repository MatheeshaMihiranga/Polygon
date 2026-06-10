const express = require('express');
const router  = express.Router();
const {
  getAllTasks, getTaskStats, getTaskById,
  createTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/stats', getTaskStats);
router.get('/',      getAllTasks);
router.get('/:id',   getTaskById);
router.post('/',     requireAdmin, createTask);
router.put('/:id',   updateTask);
router.delete('/:id', requireAdmin, deleteTask);

module.exports = router;
