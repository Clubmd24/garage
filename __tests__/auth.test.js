describe('auth module', () => {
  test('throws error when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    await expect(import('../lib/auth.js?nocache=' + Date.now())).rejects.toThrow(
      'JWT_SECRET is not defined',
    );
  });

  describe('with JWT_SECRET set', () => {
    let signToken;
    let verifyToken;

    beforeAll(async () => {
      process.env.JWT_SECRET = 'testsecret';
      const mod = await import('../lib/auth.js?nocache=' + Date.now());
      signToken = mod.signToken;
      verifyToken = mod.verifyToken;
    });

    test('signToken and verifyToken round trip', () => {
      const payload = { userId: 42 };
      const token = signToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
    });
  });
});
