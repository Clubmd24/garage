import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('ingestStandards spawns child process', async () => {
  let exit;
  const spawnMock = jest.fn(() => ({
    on: (ev, cb) => { if (ev === 'exit') exit = cb; }
  }));
  jest.unstable_mockModule('child_process', () => ({ spawn: spawnMock }));
  const { ingestStandards } = await import('../services/standardIngestService.js');
  const p = ingestStandards();
  exit(0);
  await expect(p).resolves.toBeUndefined();
  expect(spawnMock).toHaveBeenCalledWith('node', ['scripts/ingestStandards.js'], expect.any(Object));
});

test('getIngestStatus reflects running state', async () => {
  let exit;
  const spawnMock = jest.fn(() => ({
    on: (ev, cb) => { if (ev === 'exit') exit = cb; }
  }));
  jest.unstable_mockModule('child_process', () => ({ spawn: spawnMock }));
  const mod = await import('../services/standardIngestService.js');
  const p = mod.ingestStandards();
  expect(mod.getIngestStatus()).toBe(true);
  exit(0);
  await p;
  expect(mod.getIngestStatus()).toBe(false);
});
