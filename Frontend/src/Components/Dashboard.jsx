import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Check, Clock } from 'lucide-react';

// API Service
const API_URL = 'http://localhost:5000/api';

const api = {
  getTasks: async () => {
    const res = await fetch(`${API_URL}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const json = await res.json();
    // Backend returns {success, count, data} so extract the data array
    return json.data || json;
  },
  createTask: async (task) => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to create task');
    const json = await res.json();
    return json.data || json;
  },
  updateTask: async (id, task) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to update task');
    const json = await res.json();
    return json.data || json;
  },
  deleteTask: async (id) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete task');
    const json = await res.json();
    return json.data || json;
  }
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      // Ensure data is an array
      setTasks(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Failed to load tasks. Make sure the backend is running.');
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (filter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === filter));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      setLoading(true);
      if (editingTask) {
        await api.updateTask(editingTask._id, formData);
      } else {
        await api.createTask(formData);
      }
      
      await fetchTasks();
      resetForm();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setLoading(true);
      await api.deleteTask(id);
      await fetchTasks();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'pending' });
    setEditingTask(null);
    setShowForm(false);
  };

  const getStatusIcon = (status) => {
    return status === 'completed' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
              <p className="text-gray-600 mt-1">Organize your tasks efficiently</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showForm ? 'Cancel' : 'New Task'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Task Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending ({tasks.filter(t => t.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading && tasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
              No tasks found. Create your first task!
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {getStatusIcon(task.status)}
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    <p className="text-sm text-gray-400">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit task"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;