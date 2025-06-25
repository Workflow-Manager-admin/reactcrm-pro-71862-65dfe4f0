const taskService = require('../services/tasks');
const { validationResult } = require('express-validator');

class TasksController {
  // PUBLIC_INTERFACE
  async list(req, res) {
    try {
      const tasks = await taskService.listTasks(req.user.id, req.params.customerId);
      res.json({ status: 'ok', tasks });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async get(req, res) {
    try {
      const task = await taskService.getTask(req.params.id, req.user.id);
      if (!task) return res.status(404).json({ status: 'fail', message: 'Task not found' });
      res.json({ status: 'ok', task });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'fail', errors: errors.array() });
    try {
      const task = await taskService.createTask(req.body, req.user.id);
      res.status(201).json({ status: 'ok', task });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'fail', errors: errors.array() });
    try {
      const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
      if (!task) return res.status(404).json({ status: 'fail', message: 'Task not found' });
      res.json({ status: 'ok', task });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await taskService.deleteTask(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ status: 'fail', message: 'Task not found' });
      res.json({ status: 'ok', message: 'Task deleted' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new TasksController();
