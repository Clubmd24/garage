describe('db module', () => {
  test('throws error when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL;
    await expect(import('../lib/db.js?nocache=' + Date.now())).rejects.toThrow(
      'DATABASE_URL is not defined',
    );
  });
});
