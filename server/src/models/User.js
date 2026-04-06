class User {
  constructor(data = {}) {
    this.userId = data.userId || '';
    this.phoneNumber = data.phoneNumber || '';
    this.email = data.email || '';
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin || new Date();
    this.preferences = data.preferences || {
      currency: 'USD',
      notifications: true,
    };
    this.activeTripId = data.activeTripId || null;
  }

  toFirestore() {
    return {
      userId: this.userId,
      phoneNumber: this.phoneNumber,
      email: this.email,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      preferences: this.preferences,
      activeTripId: this.activeTripId,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      userId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      lastLogin: data.lastLogin?.toDate?.() || data.lastLogin,
    });
  }
}

module.exports = User;
