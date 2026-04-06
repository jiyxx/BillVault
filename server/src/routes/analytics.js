const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticate } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/analytics/spending
 * @desc    Get spending by category
 * @access  Private
 */
router.get('/spending', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;
    
    const spending = await analyticsService.getSpendingByCategory(userId, startDate, endDate);
    
    res.json({
      status: 'success',
      data: spending
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analytics/trends
 * @desc    Get monthly spending trends
 * @access  Private
 */
router.get('/trends', async (req, res, next) => {
  try {
    const { months } = req.query;
    const userId = req.user.userId;
    
    const parsedMonths = months ? parseInt(months, 10) : 6;
    const trends = await analyticsService.getMonthlyTrends(userId, parsedMonths);
    
    res.json({
      status: 'success',
      data: trends
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
