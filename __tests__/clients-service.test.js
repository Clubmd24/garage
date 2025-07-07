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
  const hashedArgs = [];
  const hashMock = jest.fn(async p => {
    hashedArgs.push(p);
    return 'HASHED';
  });
  jest.unstable_mockModule('../lib/auth.js', () => ({
    hashPassword: hashMock,
  }));
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
  const { createClient } = await import('../services/clientsService.js');
  const res = await createClient({ first_name: 'A', password: 'secret' });
  expect(hashedArgs).toEqual(['secret', '550000']);
  expect(queryMock).toHaveBeenCalled();
  expect(res.password).toBe('secret');
  expect(res.pin).toBe('550000');
  Math.random.mockRestore();
});

test('createClient generates password when missing', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 2 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('crypto', () => ({
    randomBytes: () => Buffer.from('ranpwd'),
  }));
  const hashedArgs = [];
  const hashMock = jest.fn(async p => {
    hashedArgs.push(p);
    return 'HASHED2';
  });
  jest.unstable_mockModule('../lib/auth.js', () => ({
    hashPassword: hashMock,
  }));
  jest.spyOn(Math, 'random').mockReturnValue(0.4);
  const { createClient } = await import('../services/clientsService.js');
  const res = await createClient({ first_name: 'B' });
  expect(hashedArgs[0]).toBe(res.password);
  expect(hashedArgs[1]).toBe('460000');
  expect(res.password).toBe('cmFucHdk');
  expect(res.pin).toBe('460000');
  expect(queryMock).toHaveBeenCalled();
  Math.random.mockRestore();
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

test('resetClientPassword updates hash and returns password', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const hashMock = jest.fn(async () => 'HASH');
  jest.unstable_mockModule('../lib/auth.js', () => ({
    hashPassword: hashMock,
  }));
  jest.unstable_mockModule('crypto', () => ({
    randomBytes: () => Buffer.from('newpass'),
  }));
  const { resetClientPassword } = await import('../services/clientsService.js');
  const password = await resetClientPassword(3);
  expect(password).toBe('bmV3cGFzcw');
  expect(hashMock).toHaveBeenCalledWith('bmV3cGFzcw');
  expect(queryMock).toHaveBeenCalledWith(
    'UPDATE clients SET password_hash=? WHERE id=?',
    ['HASH', 3]
  );
});

