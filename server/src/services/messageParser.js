const natural = require('natural');

/**
 * Message Parser — extracts structured expense data from
 * SMS and WhatsApp transaction messages.
 *
 * How it works:
 * 1. Normalizes the text (lowercase, remove extra spaces)
 * 2. Uses regex patterns to find amounts (e.g., "$45.00", "Rs.500")
 * 3. Uses regex + NLP tokenizer to find merchant names
 * 4. Parses dates from the text
 * 5. Returns structured data with a confidence score
 *
 * Example inputs it handles:
 * - "You spent $45.00 at Starbucks on 01/15/2026"
 * - "Rs.500 debited from your account for Amazon purchase"
 * - "Payment of USD 120.00 to Netflix successful"
 */
const tokenizer = new natural.WordTokenizer();

const messageParser = {
  /**
   * Parse an SMS transaction message.
   */
  async parseSms(messageText) {
    return this.parseMessage(messageText, 'sms');
  },

  /**
   * Parse a WhatsApp message (same logic, different source tag).
   */
  async parseWhatsapp(messageText) {
    return this.parseMessage(messageText, 'whatsapp');
  },

  /**
   * Core parsing logic — works for any text message.
   */
  async parseMessage(text, source) {
    const normalized = this.normalize(text);
    const amount = this.extractAmount(normalized);
    const merchant = this.extractMerchant(normalized);
    const date = this.extractDate(normalized);

    const result = {
      amount,
      merchant,
      date,
      source,
      description: text.substring(0, 200),
      confidenceScore: this.calculateConfidence(amount, merchant, date),
    };

    return this.validateExpenseData(result);
  },

  /**
   * Clean and normalize the raw message text.
   */
  normalize(text) {
    return text
      .replace(/\s+/g, ' ')  // collapse whitespace
      .replace(/[^\w\s$₹€£.,:/@-]/g, '') // remove unusual chars
      .trim();
  },

  /**
   * Extract monetary amount using common transaction message patterns.
   * Handles: $45.00, Rs.500, INR 1,200.50, USD 100, etc.
   */
  extractAmount(text) {
    const patterns = [
      // "spent $45.00" or "debited $100"
      /(?:spent|debited|charged|paid|payment of|amount[:\s])\s*[\$₹€£]?\s*([\d,]+\.?\d{0,2})/i,
      // "$45.00 at" or "₹500 for"
      /[\$₹€£]\s*([\d,]+\.?\d{0,2})/,
      // "Rs. 500" or "INR 1,200.50" or "USD 100.00"
      /(?:rs\.?|inr|usd|eur|gbp)\s*([\d,]+\.?\d{0,2})/i,
      // "45.00 debited"
      /([\d,]+\.\d{2})\s*(?:debited|credited|spent)/i,
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
   * Extract merchant name. Looks for patterns like:
   * "at Starbucks", "to Netflix", "for Amazon purchase"
   */
  extractMerchant(text) {
    const patterns = [
      /(?:at|to|from|for|@)\s+([A-Z][\w\s&'.]+?)(?:\s+on|\s+dated|\s+ref|\.|$)/i,
      /(?:at|to|from|@)\s+([\w\s&'.]{2,30})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Fallback: use NLP tokenizer to find capitalized words
    // that might be merchant names
    const tokens = tokenizer.tokenize(text);
    const capitalized = tokens.filter((t) => /^[A-Z][a-z]/.test(t) && t.length > 2);
    if (capitalized.length > 0) {
      return capitalized.slice(0, 2).join(' ');
    }

    return '';
  },

  /**
   * Extract date from message text.
   */
  extractDate(text) {
    const patterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4})/i,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    return new Date();
  },

  /**
   * Calculate how confident we are in the parsed data.
   * Score 0-1: amount found = +0.4, merchant found = +0.3, date found = +0.3
   */
  calculateConfidence(amount, merchant, date) {
    let score = 0;
    if (amount !== null) score += 0.4;
    if (merchant && merchant.length > 0) score += 0.3;
    if (date) score += 0.3;
    return Math.round(score * 100) / 100;
  },

  /**
   * Validate that the parsed data has minimum required fields.
   */
  validateExpenseData(data) {
    const isValid = data.amount !== null && data.amount > 0;
    return { ...data, isValid };
  },
};

module.exports = messageParser;
