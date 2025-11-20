// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'pending',
      lowercase: true
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
taskSchema.index({ status: 1 });
taskSchema.index({ createdAt: -1 });

// Instance method to toggle status
taskSchema.methods.toggleStatus = function() {
  this.status = this.status === 'pending' ? 'completed' : 'pending';
  return this.save();
};

// Static method to get task counts by status
taskSchema.statics.getStatusCounts = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Task', taskSchema);