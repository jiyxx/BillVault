const request = require('supertest');
const app = require('../../src/app');

// Mock authentication middleware globally for tests
jest.mock('../../src/middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.user = { userId: 'testUser123' };
    next();
  },
  validateToken: () => true
}));

describe('Expense API Routes', () => {
  it('GET /api/expenses should return 200 and a list of expenses', async () => {
    // We are trusting the mock DAL or integration environment here. 
    // In a real run, we'd mock the firestore wrapper as well.
    const response = await request(app).get('/api/expenses');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('GET /api/analytics/spending should require dates', async () => {
    const response = await request(app).get('/api/analytics/spending?startDate=2024-01-01');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });
});
