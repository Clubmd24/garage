import { spawn } from 'child_process';

let current = null;

export function ingestStandards() {
  if (current) return current;
  current = new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/ingestStandards.js'], {
      stdio: 'inherit',
    });
    child.on('error', err => {
      current = null;
      reject(err);
    });
    child.on('exit', code => {
      current = null;
      if (code === 0) resolve();
      else reject(new Error('ingest_failed'));
    });
  });
  return current;
}

export function getIngestStatus() {
  return !!current;
}
