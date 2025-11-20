// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /api/tasks/stats - Get task statistics (must be before /:id)
router.get('/stats', taskController.getTaskStats);

// GET /api/tasks - Get all tasks
router.get('/', taskController.getAllTasks);

// GET /api/tasks/:id - Get single task
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - Create new task
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;