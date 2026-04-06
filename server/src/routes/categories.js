const express = require('express');
const Joi = require('joi');
const categoryService = require('../services/categoryService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

const createCategorySchema = Joi.object({
  name: Joi.string().max(100).required(),
  keywords: Joi.array().items(Joi.string()).default([]),
  parentCategory: Joi.string().allow(null).default(null),
});

// GET /api/categories — list all categories (defaults + user custom)
router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.getAll(req.userId);
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories — create a custom category
router.post('/', validate(createCategorySchema), async (req, res, next) => {
  try {
    const category = await categoryService.createCustom(req.userId, req.body);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
