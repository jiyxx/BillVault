const express = require('express');
const Joi = require('joi');
const messageParser = require('../services/messageParser');
const categoryEngine = require('../services/categoryEngine');
const expenseService = require('../services/expenseService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(authenticate);

const processMessageSchema = Joi.object({
  text: Joi.string().min(5).max(1000).required(),
  source: Joi.string().valid('sms', 'whatsapp').default('sms'),
});

/**
 * POST /api/process/message
 * Parse a raw SMS/WhatsApp message → extract expense data → auto-categorize → create expense.
 *
 * Flow:
 * 1. User pastes or forwards a transaction message
 * 2. Message parser extracts amount, merchant, date using regex + NLP
 * 3. Category engine auto-categorizes the merchant
 * 4. If valid, a new expense is created
 * 5. Returns the parsed data + expense (or just parsed data if invalid)
 */
router.post('/message', validate(processMessageSchema), async (req, res, next) => {
  try {
    const { text, source } = req.body;

    // Parse the message
    const parsed = source === 'whatsapp'
      ? await messageParser.parseWhatsapp(text)
      : await messageParser.parseSms(text);

    // Auto-categorize if we found a merchant
    let category = '';
    if (parsed.merchant) {
      const result = await categoryEngine.categorizeExpense(parsed.merchant, text);
      category = result.category;
      parsed.confidenceScore = Math.max(parsed.confidenceScore, result.confidenceScore);
    }

    // If the parsing found valid expense data, create the expense
    if (parsed.isValid) {
      const expenseData = {
        amount: parsed.amount,
        merchant: parsed.merchant || 'Unknown',
        description: parsed.description,
        category,
        date: parsed.date,
        source: parsed.source,
        confidenceScore: parsed.confidenceScore,
      };

      const expense = await expenseService.create(req.userId, expenseData);
      return res.status(201).json({ expense, parsed });
    }

    // If we couldn't parse valid data, return what we found
    // so the user can manually fill in the rest
    res.json({
      message: 'Could not extract complete expense data. Please review and add manually.',
      parsed,
      category,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
