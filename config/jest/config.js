module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  coverageDirectory: '__coverage__',
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  rootDir: '../..',
  testMatch: ['**/__tests__/**/*.js'],
  testPathIgnorePatterns: [
    '/__assets__/',
    '/node_modules/',
  ],
};
