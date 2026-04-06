require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const categoryDal = require('../dal/categoryDal');

const defaultCategories = [
  {
    name: 'Food & Dining',
    keywords: ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'lunch', 'dinner', 'breakfast', 'swiggy', 'zomato', 'ubereats', 'doordash'],
  },
  {
    name: 'Transport',
    keywords: ['uber', 'lyft', 'taxi', 'cab', 'metro', 'bus', 'train', 'fuel', 'gas', 'petrol', 'parking', 'toll', 'ola'],
  },
  {
    name: 'Shopping',
    keywords: ['amazon', 'flipkart', 'walmart', 'target', 'mall', 'store', 'shop', 'retail', 'clothing', 'electronics'],
  },
  {
    name: 'Bills & Utilities',
    keywords: ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'mobile', 'recharge', 'bill', 'utility', 'rent'],
  },
  {
    name: 'Entertainment',
    keywords: ['movie', 'cinema', 'netflix', 'spotify', 'concert', 'game', 'theatre', 'amusement', 'subscription'],
  },
  {
    name: 'Health',
    keywords: ['hospital', 'doctor', 'pharmacy', 'medicine', 'medical', 'clinic', 'dentist', 'health', 'gym', 'fitness'],
  },
  {
    name: 'Travel',
    keywords: ['hotel', 'flight', 'airline', 'airbnb', 'booking', 'hostel', 'resort', 'travel', 'trip', 'vacation'],
  },
  {
    name: 'Other',
    keywords: [],
  },
];

async function seed() {
  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    await categoryDal.createDefault(cat);
    console.log(`  Created: ${cat.name}`);
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
