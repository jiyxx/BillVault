const express = require('express');
const Joi = require('joi');
const expenseService = require('../services/expenseService');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');

const router = express.Router();

// All expense routes require authentication
router.use(authenticate);

// --- Validation Schemas ---

const createExpenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  merchant: Joi.string().max(200).required(),
  description: Joi.string().max(500).allow('').default(''),
  category: Joi.string().max(100).default(''),
  date: Joi.date().iso().default(() => new Date()),
  source: Joi.string().valid('sms', 'whatsapp', 'manual', 'ocr').default('manual'),
  tripId: Joi.string().allow(null).default(null),
  imageUrl: Joi.string().uri().allow(null).default(null),
  confidenceScore: Joi.number().min(0).max(1).default(0),
});

const updateExpenseSchema = Joi.object({
  amount: Joi.number().positive(),
  currency: Joi.string().length(3),
  merchant: Joi.string().max(200),
  description: Joi.string().max(500).allow(''),
  category: Joi.string().max(100),
  date: Joi.date().iso(),
  tripId: Joi.string().allow(null),
}).min(1); // At least one field required

const listQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  category: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  tripId: Joi.string(),
});

// --- Routes ---

// GET /api/expenses — list expenses with optional filters
router.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const expenses = await expenseService.getAll(req.userId, req.query);
    res.json({ expenses, count: expenses.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/search — search expenses by keyword
router.get('/search', async (req, res, next) => {
  try {
    const expenses = await expenseService.search(req.userId, req.query.q);
    res.json({ expenses, count: expenses.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/:id — get single expense
router.get('/:id', async (req, res, next) => {
  try {
    const expense = await expenseService.getById(req.userId, req.params.id);
    res.json({ expense });
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses — create new expense
router.post('/', validate(createExpenseSchema), async (req, res, next) => {
  try {
    const expense = await expenseService.create(req.userId, req.body);
    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
});

// PUT /api/expenses/:id — update expense
router.put('/:id', validate(updateExpenseSchema), async (req, res, next) => {
  try {
    const expense = await expenseService.update(req.userId, req.params.id, req.body);
    res.json({ expense });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id — delete expense
router.delete('/:id', async (req, res, next) => {
  try {
    await expenseService.delete(req.userId, req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
