import { RuleTester } from 'eslint';
import { multipleExportsPlugin } from '../../linters/multiple-exports-plugin/multiple-exports-plugin';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaFeatures: {
        jsx: false,
      },
    },
  },
});

const rule = multipleExportsPlugin.rules['no-multiple-exports'];

describe('Multiple Exports Plugin - Integration Tests', () => {
  describe('Real-world TypeScript scenarios', () => {
    ruleTester.run('TypeScript integration', rule, {
      valid: [
        // Single component with interface
        {
          code: `interface Props {
  name: string;
}

export const Component = (props: Props) => {
  return props.name;
};`,
        },
        // Single utility function with types
        {
          code: `type Config = {
  apiUrl: string;
  timeout: number;
};

const config: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};

export const getConfig = (): Config => config;`,
        },
        // Single class with generics
        {
          code: `export class DataStore<T> {
  private data: T[] = [];
  
  add(item: T): void {
    this.data.push(item);
  }
  
  getAll(): T[] {
    return [...this.data];
  }
}`,
        },
        // Barrel file exemption
        {
          filename: '/src/components/index.ts',
          code: `export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';`,
        },
      ],
      invalid: [
        // Multiple utility functions
        {
          code: `export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  return date.toTimeString().split(' ')[0];
};`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes: '2 variables',
              },
            },
          ],
        },
        // Multiple TypeScript interfaces
        {
          code: `export interface User {
  id: string;
  name: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
}`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes: '2 interfaces',
              },
            },
          ],
        },
        // Mixed exports - class and function
        {
          code: `export class UserService {
  async getUser(id: string): Promise<User> {
    // Implementation
    return {} as User;
  }
}

export function createUserService(): UserService {
  return new UserService();
}`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes: '1 class, 1 function',
              },
            },
          ],
        },
      ],
    });
  });

  describe('JavaScript ES modules scenarios', () => {
    ruleTester.run('JavaScript integration', rule, {
      valid: [
        // Single JavaScript function
        {
          code: `export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`,
        },
        // Single default export
        {
          code: `const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  debug: process.env.NODE_ENV === 'development'
};

export default config;`,
        },
      ],
      invalid: [
        // Multiple JavaScript utilities
        {
          code: `export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes: '3 variables',
              },
            },
          ],
        },
      ],
    });
  });

  describe('Complex export patterns', () => {
    ruleTester.run('Complex patterns', rule, {
      valid: [
        // Re-export from another module
        {
          code: `export { default as lodash } from 'lodash';`,
        },
        // Single namespace export
        {
          code: `import * as utils from './utils';
export { utils };`,
        },
      ],
      invalid: [
        // Multiple re-exports
        {
          code: `export { Component1 } from './Component1';
export { Component2 } from './Component2';`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes: '2 export specifiers',
              },
            },
          ],
        },
        // Mixed default and named exports
        {
          code: `const defaultComponent = () => 'Default';
export default defaultComponent;

export const namedComponent = () => 'Named';`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes: '1 variable, 1 default export',
              },
            },
          ],
        },
      ],
    });
  });

  describe('Edge cases and advanced TypeScript', () => {
    ruleTester.run('Advanced TypeScript', rule, {
      valid: [
        // Single enum
        {
          code: `export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}`,
        },
        // Single namespace (simple)
        {
          code: `export namespace MathUtils {
  export const PI = 3.14159;
}`,
        },
      ],
      invalid: [
        // Multiple enums
        {
          code: `export enum Color {
  Red = 'red',
  Green = 'green'
}

export enum Size {
  Small = 'small',
  Large = 'large'
}`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
            },
          ],
        },
        // Multiple type aliases
        {
          code: `export type ID = string | number;
export type Status = 'pending' | 'completed' | 'failed';`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes: '2 types',
              },
            },
          ],
        },
      ],
    });
  });

  describe('Configuration presets integration', () => {
    test('recommended config should use warn level', () => {
      const config = multipleExportsPlugin.configs?.recommended;
      expect(config).toBeDefined();
      expect(config?.rules['multiple-exports/no-multiple-exports'][0]).toBe('warn');
    });

    test('strict config should use error level', () => {
      const config = multipleExportsPlugin.configs?.strict;
      expect(config).toBeDefined();
      expect(config?.rules['multiple-exports/no-multiple-exports'][0]).toBe('error');
    });

    test('both configs should have same options', () => {
      const recommendedConfig = multipleExportsPlugin.configs?.recommended;
      const strictConfig = multipleExportsPlugin.configs?.strict;

      expect(recommendedConfig?.rules['multiple-exports/no-multiple-exports'][1]).toEqual(
        strictConfig?.rules['multiple-exports/no-multiple-exports'][1],
      );
    });
  });

  describe('File type variations', () => {
    describe('JavaScript files', () => {
      ruleTester.run('JavaScript files (.js)', rule, {
        valid: [
          {
            filename: '/src/utils.js',
            code: `export function helper() { return true; }`,
          },
        ],
        invalid: [
          {
            filename: '/src/utils.js',
            code: `export function helper1() { return true; }
export function helper2() { return false; }`,
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });

    describe('TypeScript files', () => {
      ruleTester.run('TypeScript files (.ts)', rule, {
        valid: [
          {
            filename: '/src/types.ts',
            code: `export interface Config { value: string; }`,
          },
        ],
        invalid: [
          {
            filename: '/src/types.ts',
            code: `export interface Config { value: string; }
export type Status = 'active' | 'inactive';`,
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });
  });
});
