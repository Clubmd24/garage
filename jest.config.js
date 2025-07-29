import nextJest from 'next/jest.js';
import { config } from 'dotenv';
import fs from 'fs';

const envFile = fs.existsSync('.env.test')
  ? '.env.test'
  : fs.existsSync('.env.example')
  ? '.env.example'
  : null;

if (envFile) config({ path: envFile });

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'pages/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    'services/**/*.{js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
});
