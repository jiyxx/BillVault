const express = require('express');
const multer = require('multer');
const path = require('path');
const ocrProcessor = require('../services/ocrProcessor');
const categoryEngine = require('../services/categoryEngine');
const expenseService = require('../services/expenseService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

/**
 * Multer config — stores uploaded images in server/uploads/
 * with a unique filename (timestamp + original name).
 */
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/upload/image
 * Upload a receipt image → OCR extracts text → auto-categorize → create expense.
 *
 * Flow:
 * 1. User uploads an image
 * 2. Multer saves it to disk
 * 3. OCR processor extracts text and parses amount/merchant/date
 * 4. Category engine auto-categorizes based on merchant
 * 5. A new expense is created and returned
 */
router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate image format
    const validation = ocrProcessor.validateImageFormat(req.file);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // OCR: extract text and structured data from the receipt
    const ocrResult = await ocrProcessor.processReceipt(req.file.path);

    // Auto-categorize based on merchant name
    const { category, confidenceScore } = await categoryEngine.categorizeExpense(
      ocrResult.merchant,
      ocrResult.rawText
    );

    // Create expense from OCR data
    const expenseData = {
      amount: ocrResult.amount || 0,
      merchant: ocrResult.merchant || 'Unknown',
      description: `OCR: ${ocrResult.rawText.substring(0, 200)}`,
      category,
      date: ocrResult.date,
      source: 'ocr',
      confidenceScore: Math.max(ocrResult.confidenceScore, confidenceScore),
    };

    const expense = await expenseService.create(req.userId, expenseData);

    res.status(201).json({
      expense,
      ocrResult: {
        rawText: ocrResult.rawText,
        parsedAmount: ocrResult.amount,
        parsedMerchant: ocrResult.merchant,
        parsedDate: ocrResult.date,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
