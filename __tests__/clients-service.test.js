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

test('updateClient leaves password unchanged when not provided', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const hashMock = jest.fn();
  jest.unstable_mockModule('../lib/auth.js', () => ({
    hashPassword: hashMock,
  }));
  const { updateClient } = await import('../services/clientsService.js');
  await updateClient(1, { first_name: 'A' });
  expect(hashMock).not.toHaveBeenCalled();
  expect(queryMock.mock.calls[0][0]).not.toMatch(/password_hash/);
});

test('updateClient hashes password when provided', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
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
  const { updateClient } = await import('../services/clientsService.js');
  await updateClient(2, { first_name: 'B', password: 'newpw' });
  expect(hashMock).toHaveBeenCalledWith('newpw');
  expect(hashedArg).toBe('newpw');
  expect(queryMock.mock.calls[0][0]).toMatch(/password_hash/);
  expect(queryMock.mock.calls[0][1]).toContain('HASHED');
});

