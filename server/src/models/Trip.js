class Trip {
  constructor(data = {}) {
    this.tripId = data.tripId || '';
    this.userId = data.userId || '';
    this.name = data.name || '';
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || null;
    this.isActive = data.isActive || false;
    this.totalAmount = data.totalAmount || 0;
    this.expenseCount = data.expenseCount || 0;
    this.createdAt = data.createdAt || new Date();
  }

  toFirestore() {
    return {
      tripId: this.tripId,
      userId: this.userId,
      name: this.name,
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
      totalAmount: this.totalAmount,
      expenseCount: this.expenseCount,
      createdAt: this.createdAt,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Trip({
      tripId: doc.id,
      ...data,
      startDate: data.startDate?.toDate?.() || data.startDate,
      endDate: data.endDate?.toDate?.() || data.endDate,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    });
  }
}

module.exports = Trip;
