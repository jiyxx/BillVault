const { db } = require('../config/firebase');
const Trip = require('../models/Trip');
const { v4: uuidv4 } = require('uuid');

const tripsRef = (userId) => db.collection('users').doc(userId).collection('trips');

const tripDal = {
  async create(userId, tripData) {
    const tripId = uuidv4();
    const trip = new Trip({ ...tripData, tripId, userId });
    await tripsRef(userId).doc(tripId).set(trip.toFirestore());
    return trip;
  },

  async getById(userId, tripId) {
    const doc = await tripsRef(userId).doc(tripId).get();
    if (!doc.exists) return null;
    return Trip.fromFirestore(doc);
  },

  async getAll(userId) {
    const snapshot = await tripsRef(userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => Trip.fromFirestore(doc));
  },

  async update(userId, tripId, updates) {
    await tripsRef(userId).doc(tripId).update(updates);
    return this.getById(userId, tripId);
  },

  async getActive(userId) {
    const snapshot = await tripsRef(userId).where('isActive', '==', true).limit(1).get();
    if (snapshot.empty) return null;
    return Trip.fromFirestore(snapshot.docs[0]);
  },

  async activate(userId, tripId) {
    // Deactivate all trips first
    const activeTrips = await tripsRef(userId).where('isActive', '==', true).get();
    const batch = db.batch();
    activeTrips.docs.forEach((doc) => {
      batch.update(doc.ref, { isActive: false, endDate: new Date() });
    });
    // Activate the target trip
    batch.update(tripsRef(userId).doc(tripId), { isActive: true, endDate: null });
    await batch.commit();
    return this.getById(userId, tripId);
  },

  async deactivate(userId, tripId) {
    await tripsRef(userId).doc(tripId).update({ isActive: false, endDate: new Date() });
    return this.getById(userId, tripId);
  },

  async incrementExpense(userId, tripId, amount) {
    const tripRef = tripsRef(userId).doc(tripId);
    const doc = await tripRef.get();
    if (!doc.exists) return null;
    const data = doc.data();
    await tripRef.update({
      totalAmount: (data.totalAmount || 0) + amount,
      expenseCount: (data.expenseCount || 0) + 1,
    });
  },
};

module.exports = tripDal;
