class Expense {
  constructor(data = {}) {
    this.expenseId = data.expenseId || '';
    this.userId = data.userId || '';
    this.amount = data.amount || 0;
    this.currency = data.currency || 'USD';
    this.merchant = data.merchant || '';
    this.description = data.description || '';
    this.category = data.category || '';
    this.date = data.date || new Date();
    this.source = data.source || 'manual'; // 'sms', 'whatsapp', 'manual', 'ocr'
    this.tripId = data.tripId || null;
    this.imageUrl = data.imageUrl || null;
    this.confidenceScore = data.confidenceScore || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toFirestore() {
    return {
      expenseId: this.expenseId,
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      merchant: this.merchant,
      description: this.description,
      category: this.category,
      date: this.date,
      source: this.source,
      tripId: this.tripId,
      imageUrl: this.imageUrl,
      confidenceScore: this.confidenceScore,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Expense({
      expenseId: doc.id,
      ...data,
      date: data.date?.toDate?.() || data.date,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    });
  }
}

module.exports = Expense;
