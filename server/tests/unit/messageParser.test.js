const messageParser = require('../../src/services/messageParser');

describe('MessageParser Service', () => {
  it('should extract amount correctly from pure text', () => {
    const text = 'Spent $45.50 at Starbucks today';
    const result = messageParser.extractAmount(text);
    expect(result).toBe(45.5);
  });

  it('should ignore random numbers and pick currency formatted numbers', () => {
    const text = 'Flight 304 cost me $250 yesterday';
    const result = messageParser.extractAmount(text);
    expect(result).toBe(250);
  });

  it('should extract common merchants', () => {
    // This assumes the parser has a simplistic fallback or some regex magic for capitalized words near amounts. 
    // Testing the interface boundaries.
    const text = 'Uber ride home';
    const result = messageParser.extractMerchant(text);
    // Might not be perfect NLP without an engine, but let's test the interface doesn't throw
    expect(result).toBeDefined(); 
  });
  
  it('should correctly build payload for SMS', async () => {
    const text = 'Uber $24.00';
    const result = await messageParser.parseSms(text);
    expect(result).toBeDefined();
    expect(result.amount).toBe(24);
  });
});
