class Category {
  constructor(data = {}) {
    this.categoryId = data.categoryId || '';
    this.name = data.name || '';
    this.keywords = data.keywords || [];
    this.parentCategory = data.parentCategory || null;
    this.userId = data.userId || null; // null for default categories
    this.isDefault = data.isDefault !== undefined ? data.isDefault : true;
  }

  toFirestore() {
    return {
      categoryId: this.categoryId,
      name: this.name,
      keywords: this.keywords,
      parentCategory: this.parentCategory,
      userId: this.userId,
      isDefault: this.isDefault,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Category({
      categoryId: doc.id,
      ...data,
    });
  }
}

module.exports = Category;
