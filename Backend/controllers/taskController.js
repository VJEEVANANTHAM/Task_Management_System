// backend/controllers/taskController.js
const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getAllTasks = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Build query
    const query = {};
    if (status && ['pending', 'completed'].includes(status)) {
      query.status = status;
    }
    
    // Sort order
    const sortOrder = order === 'asc' ? 1 : -1;
    
    const tasks = await Task.find(query)
      .sort({ [sortBy]: sortOrder })
      .lean(); // Convert to plain JavaScript objects for better performance
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error in getAllTasks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Public
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error in getTaskById:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found - Invalid ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error fetching task', 
      error: error.message 
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Public
exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Title is required' 
      });
    }
    
    // Create task
    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'pending'
    });
    
    const savedTask = await newTask.save();
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    console.error('Error in createTask:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        errors: messages
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating task', 
      error: error.message 
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Public
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    // Validation
    if (title !== undefined && (!title || title.trim() === '')) {
      return res.status(400).json({ 
        success: false,
        message: 'Title cannot be empty' 
      });
    }
    
    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "pending" or "completed"'
        });
      }
      updateData.status = status;
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error in updateTask:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found - Invalid ID format' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        errors: messages
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error updating task', 
      error: error.message 
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    
    if (!deletedTask) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Task deleted successfully', 
      data: deletedTask 
    });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found - Invalid ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error deleting task', 
      error: error.message 
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Public
exports.getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Task.countDocuments();
    
    const formattedStats = {
      total,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      completed: stats.find(s => s._id === 'completed')?.count || 0
    };
    
    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error in getTaskStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};