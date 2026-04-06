const { db } = require('../config/firebase');
const Category = require('../models/Category');
const { v4: uuidv4 } = require('uuid');

const globalCategoriesRef = () => db.collection('global').doc('default_categories').collection('categories');
const userCategoriesRef = (userId) => db.collection('users').doc(userId).collection('categories');

const categoryDal = {
  async getDefaults() {
    const snapshot = await globalCategoriesRef().get();
    return snapshot.docs.map((doc) => Category.fromFirestore(doc));
  },

  async getUserCategories(userId) {
    const snapshot = await userCategoriesRef(userId).get();
    return snapshot.docs.map((doc) => Category.fromFirestore(doc));
  },

  async getAll(userId) {
    const defaults = await this.getDefaults();
    const custom = await this.getUserCategories(userId);
    return [...defaults, ...custom];
  },

  async createDefault(categoryData) {
    const categoryId = uuidv4();
    const category = new Category({ ...categoryData, categoryId, isDefault: true });
    await globalCategoriesRef().doc(categoryId).set(category.toFirestore());
    return category;
  },

  async createCustom(userId, categoryData) {
    const categoryId = uuidv4();
    const category = new Category({
      ...categoryData,
      categoryId,
      userId,
      isDefault: false,
    });
    await userCategoriesRef(userId).doc(categoryId).set(category.toFirestore());
    return category;
  },

  async findByKeyword(keyword) {
    // Check global categories first, then user categories
    const defaults = await this.getDefaults();
    const match = defaults.find((cat) =>
      cat.keywords.some((kw) => keyword.toLowerCase().includes(kw.toLowerCase()))
    );
    return match || null;
  },
};

module.exports = categoryDal;
