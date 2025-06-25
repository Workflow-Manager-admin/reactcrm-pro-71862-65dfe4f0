const express = require('express');
const healthController = require('../controllers/health');
const authController = require('../controllers/auth');
const usersController = require('../controllers/users');
const customersController = require('../controllers/customers');
const interactionsController = require('../controllers/interactions');
const tasksController = require('../controllers/tasks');
const metricsController = require('../controllers/metrics');
const { authenticateToken } = require('../middleware/auth');
const validators = require('../middleware/validators');

const router = express.Router();

// Health endpoint
router.get('/', healthController.check.bind(healthController));

// --- AUTH ---
router.post('/auth/signup', validators.signupValidator, authController.signup.bind(authController));
router.post('/auth/login', validators.loginValidator, authController.login.bind(authController));

// --- USERS ---
router.get('/me', authenticateToken, usersController.getMe.bind(usersController));

// --- CUSTOMERS ---
router.get('/customers', authenticateToken, customersController.list.bind(customersController));
router.get('/customers/:id', authenticateToken, customersController.get.bind(customersController));
router.post('/customers', authenticateToken, validators.customerValidator, customersController.create.bind(customersController));
router.put('/customers/:id', authenticateToken, validators.customerValidator, customersController.update.bind(customersController));
router.delete('/customers/:id', authenticateToken, customersController.delete.bind(customersController));
router.get('/customers-export', authenticateToken, customersController.exportCSV.bind(customersController));

// --- INTERACTIONS ---
router.get('/customers/:customerId/interactions', authenticateToken, interactionsController.list.bind(interactionsController));
router.post('/customers/:customerId/interactions', authenticateToken, validators.interactionValidator, interactionsController.create.bind(interactionsController));
router.get('/interactions/:id', authenticateToken, interactionsController.get.bind(interactionsController));
router.put('/interactions/:id', authenticateToken, validators.interactionValidator, interactionsController.update.bind(interactionsController));
router.delete('/interactions/:id', authenticateToken, interactionsController.delete.bind(interactionsController));

// --- TASKS ---
router.get('/customers/:customerId/tasks', authenticateToken, tasksController.list.bind(tasksController));
router.post('/customers/:customerId/tasks', authenticateToken, validators.taskValidator, tasksController.create.bind(tasksController));
router.get('/tasks/:id', authenticateToken, tasksController.get.bind(tasksController));
router.put('/tasks/:id', authenticateToken, validators.taskValidator, tasksController.update.bind(tasksController));
router.delete('/tasks/:id', authenticateToken, tasksController.delete.bind(tasksController));

// --- METRICS ---
router.get('/metrics/tasks', authenticateToken, metricsController.taskMetrics.bind(metricsController));
router.get('/metrics/interactions', authenticateToken, metricsController.interactionMetrics.bind(metricsController));

module.exports = router;
