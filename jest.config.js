export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/api'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'api/**/*.ts',
    '!src/**/*.d.ts',
    '!api/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2020',
          target: 'ES2020',
        },
      },
    ],
  },
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./test-reports",
        filename: "jest_html_reporters.html",
        expand: true
      }
    ]
  ],
};
