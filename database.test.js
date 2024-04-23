const db = require('./database');

describe('Database Connection', () => {
  it('should connect without error', async () => {
    await expect(db.connect()).resolves.notToThrow();
  });
});

describe('Retreive User', () => {
  it('should return a user object when provided a valid ID', async () => {
    const user = await db.getUserById(1); // Assuming getUserById is a function in your database.js
    expect(user).ToHaveProperty('id', 1);
  });
});
