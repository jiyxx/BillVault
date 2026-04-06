const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');
const { authenticate } = require('../middleware/auth');

// All export routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/export/pdf
 * @desc    Export expenses to PDF
 * @access  Private
 */
router.get('/pdf', async (req, res, next) => {
  try {
    const { startDate, endDate, category, tripId } = req.query;
    const userId = req.user.userId;
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${new Date().toISOString().split('T')[0]}.pdf`);
    
    await exportService.exportToPdf(userId, { startDate, endDate, category, tripId }, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/export/excel
 * @desc    Export expenses to Excel
 * @access  Private
 */
router.get('/excel', async (req, res, next) => {
  try {
    const { startDate, endDate, category, tripId } = req.query;
    const userId = req.user.userId;
    
    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    await exportService.exportToExcel(userId, { startDate, endDate, category, tripId }, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
