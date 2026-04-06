const { db } = require('../config/firebase');
const User = require('../models/User');

const usersRef = () => db.collection('users');

const mockUserStorage = new Map(); // Store users in memory for local demo bypass

const userDal = {
  async create(userData) {
    const user = new User(userData);
    try {
      const docRef = usersRef().doc(user.userId);
      await docRef.set(user.toFirestore());
    } catch (e) {
      console.warn('⚠️ Using in-memory store for user creation due to DB error');
      mockUserStorage.set(user.userId, user.toFirestore());
    }
    return user;
  },

  async getById(userId) {
    try {
      const doc = await usersRef().doc(userId).get();
      if (!doc.exists) return null;
      return User.fromFirestore(doc);
    } catch(e) {
      const data = mockUserStorage.get(userId);
      if (!data) return null;
      return new User(data);
    }
  },

  async getByPhone(phoneNumber) {
    try {
      const snapshot = await usersRef()
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return User.fromFirestore(snapshot.docs[0]);
    } catch(e) {
      const users = Array.from(mockUserStorage.values());
      const user = users.find(u => u.phoneNumber === phoneNumber);
      return user ? new User(user) : null;
    }
  },

  async getByEmail(email) {
    try {
      const snapshot = await usersRef()
        .where('email', '==', email)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return User.fromFirestore(snapshot.docs[0]);
    } catch(e) {
      const users = Array.from(mockUserStorage.values());
      const user = users.find(u => u.email === email);
      return user ? new User(user) : null;
    }
  },

  async update(userId, updates) {
    updates.updatedAt = new Date();
    try {
      await usersRef().doc(userId).update(updates);
    } catch(e) {
      const existing = mockUserStorage.get(userId) || {};
      mockUserStorage.set(userId, { ...existing, ...updates });
    }
    return this.getById(userId);
  },

  async setActiveTrip(userId, tripId) {
    try {
      await usersRef().doc(userId).update({ activeTripId: tripId });
    } catch(e) {
      const existing = mockUserStorage.get(userId) || {};
      mockUserStorage.set(userId, { ...existing, activeTripId: tripId });
    }
  },
};

module.exports = userDal;
