const interactionService = require('../services/interactions');
const { validationResult } = require('express-validator');

class InteractionsController {
  // PUBLIC_INTERFACE
  async list(req, res) {
    try {
      const interactions = await interactionService.listInteractions(req.user.id, req.params.customerId);
      res.json({ status: 'ok', interactions });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async get(req, res) {
    try {
      const interaction = await interactionService.getInteraction(req.params.id, req.user.id);
      if (!interaction) return res.status(404).json({ status: 'fail', message: 'Interaction not found' });
      res.json({ status: 'ok', interaction });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'fail', errors: errors.array() });
    try {
      const interaction = await interactionService.createInteraction(req.body, req.user.id);
      res.status(201).json({ status: 'ok', interaction });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'fail', errors: errors.array() });
    try {
      const interaction = await interactionService.updateInteraction(req.params.id, req.body, req.user.id);
      if (!interaction) return res.status(404).json({ status: 'fail', message: 'Interaction not found' });
      res.json({ status: 'ok', interaction });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await interactionService.deleteInteraction(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ status: 'fail', message: 'Interaction not found' });
      res.json({ status: 'ok', message: 'Interaction deleted' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new InteractionsController();
