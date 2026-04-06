const express = require('express');
const Joi = require('joi');
const tripService = require('../services/tripService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(authenticate);

const createTripSchema = Joi.object({
  name: Joi.string().max(200).required(),
  startDate: Joi.date().iso().default(() => new Date()),
});

// GET /api/trips — list all trips
router.get('/', async (req, res, next) => {
  try {
    const trips = await tripService.getAll(req.userId);
    res.json({ trips });
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/active — get current active trip
router.get('/active', async (req, res, next) => {
  try {
    const trip = await tripService.getActive(req.userId);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id — get single trip
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await tripService.getById(req.userId, req.params.id);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id/expenses — get all expenses for a trip
router.get('/:id/expenses', async (req, res, next) => {
  try {
    const expenses = await tripService.getTripExpenses(req.userId, req.params.id);
    res.json({ expenses, count: expenses.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips — create a new trip
router.post('/', validate(createTripSchema), async (req, res, next) => {
  try {
    const trip = await tripService.create(req.userId, req.body);
    res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id/activate — activate a trip
router.put('/:id/activate', async (req, res, next) => {
  try {
    const trip = await tripService.activate(req.userId, req.params.id);
    res.json({ trip, message: 'Trip activated' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id/deactivate — deactivate a trip
router.put('/:id/deactivate', async (req, res, next) => {
  try {
    const trip = await tripService.deactivate(req.userId, req.params.id);
    res.json({ trip, message: 'Trip deactivated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
