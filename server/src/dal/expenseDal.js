const { db } = require('../config/firebase');
const Expense = require('../models/Expense');
const { v4: uuidv4 } = require('uuid');

const expensesRef = (userId) => db.collection('users').doc(userId).collection('expenses');

const expenseDal = {
  async create(userId, expenseData) {
    const expenseId = uuidv4();
    const expense = new Expense({ ...expenseData, expenseId, userId });
    await expensesRef(userId).doc(expenseId).set(expense.toFirestore());
    return expense;
  },

  async getById(userId, expenseId) {
    const doc = await expensesRef(userId).doc(expenseId).get();
    if (!doc.exists) return null;
    return Expense.fromFirestore(doc);
  },

  async getAll(userId, { limit = 50, offset = 0, category, startDate, endDate, tripId } = {}) {
    let query = expensesRef(userId).orderBy('date', 'desc');

    if (category) query = query.where('category', '==', category);
    if (tripId) query = query.where('tripId', '==', tripId);
    if (startDate) query = query.where('date', '>=', new Date(startDate));
    if (endDate) query = query.where('date', '<=', new Date(endDate));

    query = query.offset(offset).limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => Expense.fromFirestore(doc));
  },

  async update(userId, expenseId, updates) {
    updates.updatedAt = new Date();
    await expensesRef(userId).doc(expenseId).update(updates);
    return this.getById(userId, expenseId);
  },

  async delete(userId, expenseId) {
    await expensesRef(userId).doc(expenseId).delete();
    return true;
  },

  async search(userId, searchTerm) {
    // Firestore doesn't support full-text search natively,
    // so we fetch and filter in memory for now.
    const snapshot = await expensesRef(userId).orderBy('date', 'desc').limit(200).get();
    const expenses = snapshot.docs.map((doc) => Expense.fromFirestore(doc));
    const term = searchTerm.toLowerCase();

    return expenses.filter(
      (e) =>
        e.merchant.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term)
    );
  },

  async getByTrip(userId, tripId) {
    const snapshot = await expensesRef(userId)
      .where('tripId', '==', tripId)
      .orderBy('date', 'desc')
      .get();
    return snapshot.docs.map((doc) => Expense.fromFirestore(doc));
  },
};

module.exports = expenseDal;
