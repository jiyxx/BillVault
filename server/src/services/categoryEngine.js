const natural = require('natural');
const categoryDal = require('../dal/categoryDal');

/**
 * Category Engine — auto-categorizes expenses based on merchant name
 * and description using keyword matching + NLP.
 *
 * How it works:
 * 1. First tries exact keyword matching against all category keywords
 *    (e.g., "Starbucks" matches the keyword "coffee" → "Food & Dining")
 * 2. If no exact match, uses Jaro-Winkler string distance for fuzzy matching
 *    (e.g., "Starbuks" still matches "starbucks")
 * 3. Returns the best match with a confidence score (0-1)
 * 4. Falls back to "Other" if no good match is found
 */
const categoryEngine = {
  /**
   * Categorize an expense based on merchant and description.
   * Returns { category, confidenceScore }.
   */
  async categorizeExpense(merchant, description = '') {
    const text = `${merchant} ${description}`.toLowerCase();
    const categories = await categoryDal.getDefaults();

    let bestMatch = null;
    let bestScore = 0;

    for (const cat of categories) {
      if (!cat.keywords || cat.keywords.length === 0) continue;

      for (const keyword of cat.keywords) {
        // Exact substring match — high confidence
        if (text.includes(keyword.toLowerCase())) {
          const score = 0.9;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = cat;
          }
        } else {
          // Fuzzy match using Jaro-Winkler distance
          const distance = natural.JaroWinklerDistance(
            keyword.toLowerCase(),
            merchant.toLowerCase()
          );
          if (distance > 0.85 && distance > bestScore) {
            bestScore = distance * 0.8; // Scale down fuzzy matches
            bestMatch = cat;
          }
        }
      }
    }

    // Default to "Other" if nothing matched well
    if (!bestMatch || bestScore < 0.5) {
      const other = categories.find((c) => c.name === 'Other');
      return {
        category: other ? other.name : 'Other',
        confidenceScore: 0.1,
      };
    }

    return {
      category: bestMatch.name,
      confidenceScore: Math.round(bestScore * 100) / 100,
    };
  },

  /**
   * Get multiple category suggestions with scores.
   * Useful for showing the user a dropdown of likely categories.
   */
  async getCategorySuggestions(text) {
    const categories = await categoryDal.getDefaults();
    const suggestions = [];

    for (const cat of categories) {
      let maxScore = 0;
      for (const keyword of cat.keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          maxScore = Math.max(maxScore, 0.9);
        } else {
          const dist = natural.JaroWinklerDistance(keyword.toLowerCase(), text.toLowerCase());
          maxScore = Math.max(maxScore, dist * 0.8);
        }
      }
      if (maxScore > 0.3) {
        suggestions.push({ category: cat.name, score: Math.round(maxScore * 100) / 100 });
      }
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  },

  /**
   * Learn from user corrections — when a user manually picks
   * a category, add the merchant as a keyword to improve future matches.
   */
  async learnFromUserInput(merchant, userCategory) {
    const categories = await categoryDal.getDefaults();
    const cat = categories.find((c) => c.name === userCategory);
    if (cat && !cat.keywords.includes(merchant.toLowerCase())) {
      cat.keywords.push(merchant.toLowerCase());
      // In a real app, you'd persist this update to Firestore
      console.log(`Learned: "${merchant}" → "${userCategory}"`);
    }
  },
};

module.exports = categoryEngine;
