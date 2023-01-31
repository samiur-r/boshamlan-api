"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    moduleFileExtensions: ['js', 'ts', 'json'],
    moduleDirectories: [__dirname, 'src', 'node_modules'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map