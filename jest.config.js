module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    moduleNameMapper: {
      '^axios$': '<rootDir>/src/__mocks__/axios.js',
      '\\.(css|less|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
      '\\.(gif|ttf|eot|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], // Изменено с setupFiles на setupFilesAfterEnv
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/index.js'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    verbose: true
  };