const { body } = require('express-validator');

const signupValidator = [
  body('name').trim().notEmpty().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

const loginValidator = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

const customerValidator = [
  body('name').trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('company').optional().isString(),
  body('notes').optional().isString(),
];

const interactionValidator = [
  body('customer_id').notEmpty(),
  body('type').isIn(['call', 'meeting', 'email']),
  body('description').notEmpty(),
  body('timestamp').optional().isISO8601(),
];

const taskValidator = [
  body('customer_id').notEmpty(),
  body('title').notEmpty(),
  body('due_date').isISO8601().toDate(),
  body('status').optional().isIn(['pending', 'completed']),
];

module.exports = {
  signupValidator,
  loginValidator,
  customerValidator,
  interactionValidator,
  taskValidator,
};
