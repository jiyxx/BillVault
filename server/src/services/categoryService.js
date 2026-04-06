const categoryDal = require('../dal/categoryDal');

/**
 * Category Service — manages default + custom categories.
 * Default categories are shared globally (Food, Transport, etc.).
 * Users can create custom categories that only they see.
 */
const categoryService = {
  async getAll(userId) {
    return categoryDal.getAll(userId);
  },

  async createCustom(userId, data) {
    return categoryDal.createCustom(userId, data);
  },

  async findByKeyword(keyword) {
    return categoryDal.findByKeyword(keyword);
  },
};

module.exports = categoryService;
