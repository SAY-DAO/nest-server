import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  preset: 'ts-jest',
//   setupFilesAfterEnv: ['/jest.setup.ts'],
};

export default config;
