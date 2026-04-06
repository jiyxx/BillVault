const expenseDal = require('../dal/expenseDal');
const tripDal = require('../dal/tripDal');
const { AppError } = require('../middleware/errorHandler');

/**
 * Expense Service — handles business logic for expenses.
 * Key behavior: if the user has an active trip, new expenses
 * are automatically assigned to that trip.
 */
const expenseService = {
  async create(userId, data) {
    // Auto-assign to active trip if one exists
    const activeTrip = await tripDal.getActive(userId);
    if (activeTrip && !data.tripId) {
      data.tripId = activeTrip.tripId;
    }

    const expense = await expenseDal.create(userId, data);

    // Update trip totals if expense belongs to a trip
    if (expense.tripId) {
      await tripDal.incrementExpense(userId, expense.tripId, expense.amount);
    }

    return expense;
  },

  async getById(userId, expenseId) {
    const expense = await expenseDal.getById(userId, expenseId);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    return expense;
  },

  async getAll(userId, filters) {
    return expenseDal.getAll(userId, filters);
  },

  async update(userId, expenseId, updates) {
    const existing = await expenseDal.getById(userId, expenseId);
    if (!existing) {
      throw new AppError('Expense not found', 404);
    }
    return expenseDal.update(userId, expenseId, updates);
  },

  async delete(userId, expenseId) {
    const existing = await expenseDal.getById(userId, expenseId);
    if (!existing) {
      throw new AppError('Expense not found', 404);
    }
    return expenseDal.delete(userId, expenseId);
  },

  async search(userId, searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new AppError('Search term must be at least 2 characters', 400);
    }
    return expenseDal.search(userId, searchTerm);
  },
};

module.exports = expenseService;
