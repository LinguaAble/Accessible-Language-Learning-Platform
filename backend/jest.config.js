module.exports = {
    testEnvironment: 'node',
    testTimeout: 30000, // 30 seconds for database operations
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: false,
    restoreMocks: false,
    detectOpenHandles: false,
};
