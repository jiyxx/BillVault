const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * OCR Processor — extracts text from receipt/bill images.
 * Uses Tesseract.js (runs locally, no cloud API needed).
 * The interface is designed so you can swap in Google Cloud Vision
 * or AWS Textract by changing the extractText implementation.
 */
const ocrProcessor = {
  /**
   * Validate that the uploaded file is a supported image format.
   */
  validateImageFormat(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: `Unsupported format: ${file.mimetype}. Use JPEG, PNG, WebP, BMP, or TIFF.` };
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }
    return { valid: true };
  },

  /**
   * Extract raw text from an image using Tesseract.js OCR.
   * Returns the full recognized text.
   */
  async extractText(imagePath) {
    const { data } = await Tesseract.recognize(imagePath, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });
    return data.text;
  },

  /**
   * Process a receipt image: extract text, then parse out
   * structured expense data (amount, merchant, date).
   */
  async processReceipt(imagePath) {
    const rawText = await this.extractText(imagePath);

    // Parse structured data from raw OCR text
    const amount = this.parseAmount(rawText);
    const merchant = this.parseMerchant(rawText);
    const date = this.parseDate(rawText);

    return {
      rawText,
      amount,
      merchant,
      date,
      confidenceScore: amount ? 0.7 : 0.3, // Higher confidence if we found an amount
    };
  },

  /**
   * Find monetary amounts in OCR text.
   * Looks for patterns like $12.50, Rs. 500, USD 100.00, etc.
   */
  parseAmount(text) {
    const patterns = [
      /(?:total|amount|grand total|net|balance)[:\s]*[\$₹€£]?\s*([\d,]+\.?\d{0,2})/i,
      /[\$₹€£]\s*([\d,]+\.?\d{0,2})/,
      /(?:rs\.?|inr|usd|eur|gbp)\s*([\d,]+\.?\d{0,2})/i,
      /([\d,]+\.\d{2})\s*(?:total|due)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    return null;
  },

  /**
   * Try to find the merchant/store name — usually appears
   * in the first few lines of a receipt.
   */
  parseMerchant(text) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    // The first non-empty, non-numeric line is often the store name
    for (const line of lines.slice(0, 5)) {
      if (line.length > 2 && line.length < 60 && !/^\d+$/.test(line)) {
        return line;
      }
    }
    return '';
  },

  /**
   * Find a date in the OCR text.
   */
  parseDate(text) {
    const patterns = [
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/,
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    return new Date(); // Default to today
  },
};

module.exports = ocrProcessor;
