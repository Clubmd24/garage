import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('createClient uses provided password', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 1 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  let hashedArg;
  const hashMock = jest.fn(async p => {
    hashedArg = p;
    return 'HASHED';
  });
  jest.unstable_mockModule('../lib/auth.js', () => ({
    hashPassword: hashMock,
  }));
  const { createClient } = await import('../services/clientsService.js');
  const res = await createClient({ first_name: 'A', password: 'secret' });
  expect(hashMock).toHaveBeenCalledWith('secret');
  expect(hashedArg).toBe('secret');
  expect(queryMock).toHaveBeenCalled();
  expect(res.password).toBe('secret');
});

test('createClient generates password when missing', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 2 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('crypto', () => ({
    randomBytes: () => Buffer.from('ranpwd'),
  }));
  let hashedArg;
  const hashMock = jest.fn(async p => {
    hashedArg = p;
    return 'HASHED2';
  });
  jest.unstable_mockModule('../lib/auth.js', () => ({
    hashPassword: hashMock,
  }));
  const { createClient } = await import('../services/clientsService.js');
  const res = await createClient({ first_name: 'B' });
  expect(hashMock).toHaveBeenCalledWith(res.password);
  expect(hashedArg).toBe(res.password);
  expect(res.password).toBe('cmFucHdk');
  expect(queryMock).toHaveBeenCalled();
});

