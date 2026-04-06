const tripDal = require('../dal/tripDal');
const expenseDal = require('../dal/expenseDal');
const userDal = require('../dal/userDal');
const { AppError } = require('../middleware/errorHandler');

/**
 * Trip Service — manages trip lifecycle.
 *
 * Key concepts:
 * - Only ONE trip can be active at a time per user
 * - When you activate a trip, any currently active trip gets deactivated
 * - While a trip is active, new expenses auto-assign to it
 * - Trip tracks totalAmount and expenseCount for quick summaries
 */
const tripService = {
  async create(userId, data) {
    return tripDal.create(userId, data);
  },

  async getAll(userId) {
    return tripDal.getAll(userId);
  },

  async getById(userId, tripId) {
    const trip = await tripDal.getById(userId, tripId);
    if (!trip) throw new AppError('Trip not found', 404);
    return trip;
  },

  /**
   * Activate a trip — deactivates any other active trip first,
   * then sets this trip as active and updates the user's activeTripId.
   */
  async activate(userId, tripId) {
    const trip = await tripDal.getById(userId, tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    const activated = await tripDal.activate(userId, tripId);
    await userDal.setActiveTrip(userId, tripId);
    return activated;
  },

  /**
   * Deactivate a trip — sets endDate and clears user's activeTripId.
   */
  async deactivate(userId, tripId) {
    const trip = await tripDal.getById(userId, tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    const deactivated = await tripDal.deactivate(userId, tripId);
    await userDal.setActiveTrip(userId, null);
    return deactivated;
  },

  /**
   * Get all expenses belonging to a specific trip.
   */
  async getTripExpenses(userId, tripId) {
    const trip = await tripDal.getById(userId, tripId);
    if (!trip) throw new AppError('Trip not found', 404);
    return expenseDal.getByTrip(userId, tripId);
  },

  /**
   * Get the currently active trip (if any).
   */
  async getActive(userId) {
    return tripDal.getActive(userId);
  },
};

module.exports = tripService;
