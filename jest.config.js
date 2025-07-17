import { config } from 'dotenv';
import fs from 'fs';

const envFile = fs.existsSync('.env.test')
  ? '.env.test'
  : fs.existsSync('.env.example')
  ? '.env.example'
  : null;

if (envFile) config({ path: envFile });

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [],
};
