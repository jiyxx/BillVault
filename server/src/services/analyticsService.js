const { db } = require('../config/firebase');
const expenseDal = require('../dal/expenseDal');
const categoryDal = require('../dal/categoryDal');
const tripDal = require('../dal/tripDal');

class AnalyticsService {
  /**
   * Get spending by category for a specific date range
   */
  async getSpendingByCategory(userId, startDate, endDate) {
    try {
      // Create query for expenses in date range
      let expensesQuery = db.collection('users').doc(userId).collection('expenses');
      
      if (startDate) {
        expensesQuery = expensesQuery.where('date', '>=', new Date(startDate));
      }
      
      if (endDate) {
        // Set to end of day
        const endDay = new Date(endDate);
        endDay.setHours(23, 59, 59, 999);
        expensesQuery = expensesQuery.where('date', '<=', endDay);
      }
      
      const snapshot = await expensesQuery.get();
      const expenses = snapshot.docs.map(doc => doc.data());
      
      // Get reference categories to resolve names
      const categories = await categoryDal.getAllCategories(userId);
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.categoryId] = cat.name;
      });
      
      // Aggregate by category
      const spendingByCategory = {};
      
      expenses.forEach(expense => {
        const catId = expense.categoryId || 'uncategorized';
        const catName = categoryMap[catId] || catId;
        
        if (!spendingByCategory[catName]) {
          spendingByCategory[catName] = {
            amount: 0,
            count: 0,
            currency: expense.currency || 'USD'
          };
        }
        
        spendingByCategory[catName].amount += (expense.amount || 0);
        spendingByCategory[catName].count += 1;
      });
      
      // Convert to array and sort by amount descending
      return Object.entries(spendingByCategory)
        .map(([category, data]) => ({
          category,
          amount: Number(data.amount.toFixed(2)),
          count: data.count,
          currency: data.currency
        }))
        .sort((a, b) => b.amount - a.amount);
        
    } catch (error) {
      console.error('Error generating category analytics:', error);
      throw new Error(`Failed to generate spending analytics: ${error.message}`);
    }
  }

  /**
   * Get monthly spending trends for the last X months
   */
  async getMonthlyTrends(userId, months = 6) {
    try {
      // Calculate start date (X months ago from 1st of current month)
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
      
      const expensesQuery = db.collection('users')
        .doc(userId)
        .collection('expenses')
        .where('date', '>=', startDate)
        .orderBy('date', 'asc');
        
      const snapshot = await expensesQuery.get();
      const expenses = snapshot.docs.map(doc => doc.data());
      
      // Initialize months array
      const trends = {};
      for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trends[monthKey] = {
          month: monthKey,
          total: 0,
          count: 0
        };
      }
      
      // Aggregate by month
      expenses.forEach(expense => {
        // Handle Firestore Timestamp or Date object or string
        let dateObj;
        if (expense.date && expense.date.toDate) {
          dateObj = expense.date.toDate();
        } else {
          dateObj = new Date(expense.date);
        }
        
        const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        if (trends[monthKey]) {
          trends[monthKey].total += (expense.amount || 0);
          trends[monthKey].count += 1;
        }
      });
      
      // Convert to array and sort chronologically
      return Object.values(trends)
        .map(item => ({
          ...item,
          total: Number(item.total.toFixed(2))
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
        
    } catch (error) {
      console.error('Error generating trend analytics:', error);
      throw new Error(`Failed to generate monthly trends: ${error.message}`);
    }
  }

  /**
   * Get trip spending summary
   */
  async getTripSummary(userId, tripId) {
    try {
      const trip = await tripDal.getTripById(userId, tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }
      
      const expenses = await tripDal.getTripExpenses(userId, tripId);
      
      // Get category reference
      const categories = await categoryDal.getAllCategories(userId);
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.categoryId] = cat.name;
      });
      
      // Aggregate by category
      const spendingByCategory = {};
      
      expenses.forEach(expense => {
        const catId = expense.categoryId || 'uncategorized';
        const catName = categoryMap[catId] || catId;
        
        if (!spendingByCategory[catName]) {
          spendingByCategory[catName] = 0;
        }
        
        spendingByCategory[catName] += (expense.amount || 0);
      });
      
      // Prepare response
      const categoryBreakdown = Object.entries(spendingByCategory)
        .map(([category, amount]) => ({
          category,
          amount: Number(amount.toFixed(2))
        }))
        .sort((a, b) => b.amount - a.amount);
        
      // Add daily average if trip is completed
      let dailyAverage = 0;
      let durationDays = 0;
      
      if (trip.startDate && expenses.length > 0) {
        const end = trip.endDate ? new Date(trip.endDate) : new Date();
        const start = new Date(trip.startDate);
        const timeDiff = Math.abs(end.getTime() - start.getTime());
        durationDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        dailyAverage = trip.totalAmount / durationDays;
      }
      
      return {
        tripId: trip.tripId,
        name: trip.name,
        totalAmount: trip.totalAmount,
        expenseCount: trip.expenseCount,
        durationDays,
        dailyAverage: Number(dailyAverage.toFixed(2)),
        currency: expenses.length > 0 ? expenses[0].currency : 'USD',
        categoryBreakdown
      };
        
    } catch (error) {
      console.error('Error generating trip summary:', error);
      throw new Error(`Failed to generate trip summary: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();
