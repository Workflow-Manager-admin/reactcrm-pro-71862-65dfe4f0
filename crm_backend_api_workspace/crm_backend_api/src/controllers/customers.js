const customerService = require('../services/customers');
const { validationResult } = require('express-validator');

// PUBLIC_INTERFACE
class CustomersController {
  async list(req, res) {
    try {
      const customers = await customerService.listCustomers(req.user.id);
      res.json({ status: 'ok', customers });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async get(req, res) {
    try {
      const customer = await customerService.getCustomer(req.params.id, req.user.id);
      if (!customer) {
        return res.status(404).json({ status: 'fail', message: 'Customer not found' });
      }
      res.json({ status: 'ok', customer });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'fail', errors: errors.array() });
    try {
      const customer = await customerService.createCustomer({ ...req.body, owner_id: req.user.id });
      res.status(201).json({ status: 'ok', customer });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'fail', errors: errors.array() });
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body, req.user.id);
      if (!customer) return res.status(404).json({ status: 'fail', message: 'Customer not found' });
      res.json({ status: 'ok', customer });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await customerService.deleteCustomer(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ status: 'fail', message: 'Customer not found' });
      res.json({ status: 'ok', message: 'Customer deleted' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async exportCSV(req, res) {
    try {
      const csvStream = await customerService.exportCustomersCSV(req.user.id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      csvStream.pipe(res);
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new CustomersController();
