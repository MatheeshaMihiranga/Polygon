const express = require('express');
const router  = express.Router();
const { getAllEmployees, getUserById, updateUser } = require('../controllers/userController');
const { authenticate, requireAdmin }              = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/employees', requireAdmin, getAllEmployees);
router.get('/:id',       getUserById);
router.put('/:id',       updateUser);

module.exports = router;
