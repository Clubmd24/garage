let signToken;
let verifyToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  const mod = await import('../lib/auth.js');
  signToken = mod.signToken;
  verifyToken = mod.verifyToken;
});

test('signToken and verifyToken round trip', () => {
  const payload = { userId: 42 };
  const token = signToken(payload);
  const decoded = verifyToken(token);
  expect(decoded.userId).toBe(payload.userId);
});
