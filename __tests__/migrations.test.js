import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { execFile } from 'child_process';
import util from 'util';

const exec = util.promisify(execFile);

// Use TEST_DB_URL to connect to a MySQL server. If not provided, skip the test.
const testDbUrl = process.env.TEST_DB_URL;

(testDbUrl ? describe : describe.skip)('migrations', () => {
  let adminConn;
  let dbUrl;
  let dbName;

  beforeAll(async () => {
    // Ensure we have a server to connect to
    const url = new URL(testDbUrl);
    dbName = `test_migrate_${Date.now()}`;
    const rootUrl = new URL(testDbUrl);
    rootUrl.pathname = '/';
    adminConn = await mysql.createConnection(rootUrl.toString());
    await adminConn.query(`CREATE DATABASE \`${dbName}\``);
    dbUrl = new URL(testDbUrl);
    dbUrl.pathname = `/${dbName}`;
  });

  afterAll(async () => {
    if (adminConn) {
      await adminConn.query(`DROP DATABASE \`${dbName}\``);
      await adminConn.end();
    }
  });

  test('applies all migrations', async () => {
    await exec('node', ['scripts/migrate.js'], {
      env: { ...process.env, DATABASE_URL: dbUrl.toString() },
    });

    const conn = await mysql.createConnection(dbUrl.toString() + '?multipleStatements=true');
    const [rows] = await conn.query('SELECT filename FROM schema_migrations ORDER BY filename');
    await conn.end();

    const files = fs
      .readdirSync(path.resolve(__dirname, '../migrations'))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    expect(rows.map((r) => r.filename)).toEqual(files);
  });
});
