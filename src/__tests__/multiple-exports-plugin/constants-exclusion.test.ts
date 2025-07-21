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

describe('Constants Exclusion Feature', () => {
  describe('excludeConstants: true', () => {
    describe('Should allow multiple const exports', () => {
      ruleTester.run('Multiple const exports allowed', rule, {
        valid: [
          // Multiple const exports should be allowed
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';
export const DEFAULT_TIMEOUT = 5000;`,
            options: [{ excludeConstants: true }],
          },
          // Const exports with various value types
          {
            code: `export const CONFIG = { api: 'https://api.example.com' };
export const COLORS = ['red', 'green', 'blue'];
export const isProduction = process.env.NODE_ENV === 'production';`,
            options: [{ excludeConstants: true }],
          },
          // Arrow function constants
          {
            code: `export const createUser = () => ({ id: Math.random() });
export const validateEmail = (email: string) => /^[^@]+@[^@]+$/.test(email);
export const API_VERSION = 'v1';`,
            options: [{ excludeConstants: true }],
          },
          // Mixed const exports and other types that don't conflict
          {
            code: `export const CONFIG = { value: 'test' };
export const API_URL = 'https://api.example.com';
export class UserService {}`,
            options: [{ excludeConstants: true }],
          },
        ],
        invalid: [],
      });
    });

    describe('Should still flag non-const variables', () => {
      ruleTester.run('Multiple let/var exports flagged', rule, {
        valid: [],
        invalid: [
          // Multiple let exports should be flagged
          {
            code: `export let currentUser = null;
export let sessionToken = '';`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
          // Multiple var exports should be flagged
          {
            code: `export var globalConfig = {};
export var debugMode = false;`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
          // Mixed let and var exports should be flagged
          {
            code: `export let userSettings = {};
export var appState = { loaded: false };`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });

    describe('Should handle mixed const and non-const variables', () => {
      ruleTester.run('Mixed variable types with exclusion', rule, {
        valid: [
          // Multiple consts with single let should be valid (only let would be flagged if there were multiple)
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';
export let currentUser = null;`,
            options: [{ excludeConstants: true }],
          },
        ],
        invalid: [
          // Multiple consts with multiple lets - only lets should be flagged
          {
            code: `export const API_URL = 'https://api.example.com'; // allowed
export const VERSION = '1.0.0'; // allowed
export let currentUser = null; // flagged
export let sessionData = {}; // flagged`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
          // Multiple consts with multiple vars - only vars should be flagged
          {
            code: `export const CONFIG = { value: 'test' }; // allowed
export var globalState = {}; // flagged
export var debugMode = false; // flagged`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });
  });

  describe('excludeConstants: false (default behavior)', () => {
    describe('Should flag multiple const exports', () => {
      ruleTester.run('Default behavior unchanged', rule, {
        valid: [],
        invalid: [
          // Multiple const exports should be flagged with default behavior
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';`,
            options: [{ excludeConstants: false }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
          // No options provided (should use default)
          {
            code: `export const CONFIG = { value: 'test' };
export const TIMEOUT = 5000;`,
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
          // Explicit false option
          {
            code: `export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = !isProduction;`,
            options: [{ excludeConstants: false }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });
  });

  describe('Option interaction with checkVariables', () => {
    describe('excludeConstants has no effect when checkVariables: false', () => {
      ruleTester.run('No effect when variables not checked', rule, {
        valid: [
          // Multiple const exports should be ignored when checkVariables is false
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';
export const CONFIG = { value: 'test' };`,
            options: [{ checkVariables: false, excludeConstants: true }],
          },
          // Multiple let exports should also be ignored when checkVariables is false
          {
            code: `export let currentUser = null;
export let sessionToken = '';
export let appState = {};`,
            options: [{ checkVariables: false, excludeConstants: true }],
          },
          // Mixed variable types should be ignored when checkVariables is false
          {
            code: `export const API_URL = 'https://api.example.com';
export let currentUser = null;
export var debugMode = false;`,
            options: [{ checkVariables: false, excludeConstants: true }],
          },
        ],
        invalid: [
          // Other export types should still be checked
          {
            code: `export const CONFIG = { value: 'test' }; // ignored due to checkVariables: false
export function func1() {}
export function func2() {}`,
            options: [{ checkVariables: false, excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });

    describe('excludeConstants works with checkVariables: true', () => {
      ruleTester.run('Proper interaction when variables checked', rule, {
        valid: [
          // Multiple const exports should be allowed when both options are true
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';`,
            options: [{ checkVariables: true, excludeConstants: true }],
          },
        ],
        invalid: [
          // Multiple let exports should be flagged when checkVariables is true
          {
            code: `export let currentUser = null;
export let sessionData = {};`,
            options: [{ checkVariables: true, excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });
  });

  describe('Edge cases and complex scenarios', () => {
    describe('Variable declarations with multiple declarators', () => {
      ruleTester.run('Multiple declarators in one statement', rule, {
        valid: [
          // Const declaration with multiple declarators should be treated as one export
          {
            code: `export const API_URL = 'https://api.example.com', VERSION = '1.0.0';
export const ANOTHER_CONST = 'value';`,
            options: [{ excludeConstants: true }],
          },
        ],
        invalid: [
          // Let declaration with multiple declarators should still be flagged if there are multiple such exports
          {
            code: `export let user = null, session = '';
export let appData = {}, isLoading = false;`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });

    describe('Destructuring assignments', () => {
      ruleTester.run('Destructuring in exports', rule, {
        valid: [
          // Const destructuring should be allowed when excludeConstants is true
          {
            code: `export const { API_URL, VERSION } = config;
export const { DEFAULT_TIMEOUT } = settings;`,
            options: [{ excludeConstants: true }],
          },
          // Single let destructuring should be valid (no multiple exports)
          {
            code: `export let { currentUser } = session;`,
            options: [{ excludeConstants: true }],
          },
        ],
        invalid: [
          // Multiple let destructuring should be flagged when there are multiple exports
          {
            code: `export let userState = {};
export let sessionData = {};`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });

    describe('Complex mixed exports', () => {
      ruleTester.run('Complex scenarios with mixed export types', rule, {
        valid: [
          // Complex valid scenario - multiple consts with single other types
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';
export const CONFIG = { timeout: 5000 };
export class UserService {}`,
            options: [{ excludeConstants: true }],
          },
        ],
        invalid: [
          // Complex invalid scenario - multiple non-const exports
          {
            code: `export const API_URL = 'https://api.example.com'; // allowed
export const VERSION = '1.0.0'; // allowed  
export class UserService {} // flagged
export class AdminService {} // flagged`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
          // Complex invalid scenario - multiple non-const variables
          {
            code: `export const API_URL = 'https://api.example.com'; // allowed
export const VERSION = '1.0.0'; // allowed  
export let currentUser = null; // flagged
export let sessionData = {}; // flagged
export class UserService {} // single class, allowed`,
            options: [{ excludeConstants: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });
  });

  describe('Backwards compatibility', () => {
    describe('Existing configurations continue to work', () => {
      ruleTester.run('No breaking changes', rule, {
        valid: [
          // Single const export should still be valid with old configuration
          {
            code: `export const API_URL = 'https://api.example.com';`,
            options: [{ checkVariables: true }],
          },
          // Existing configuration without excludeConstants should work
          {
            code: `export class UserService {}`,
            options: [
              {
                checkClasses: true,
                checkFunctions: true,
                checkVariables: true,
              },
            ],
          },
        ],
        invalid: [
          // Multiple const exports should still be flagged with old configuration
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';`,
            options: [{ checkVariables: true }],
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
          // Default behavior should be unchanged
          {
            code: `export const CONFIG = { value: 'test' };
export const TIMEOUT = 5000;`,
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });
  });

  describe('Configuration presets', () => {
    describe('Recommended and strict configs include new option', () => {
      ruleTester.run('Preset configurations work correctly', rule, {
        valid: [
          // Single exports should still be valid with any preset
          {
            code: `export const API_URL = 'https://api.example.com';`,
          },
        ],
        invalid: [
          // Multiple const exports should be flagged with default preset behavior
          {
            code: `export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';`,
            errors: [{ messageId: 'multipleExportsDetailed' }],
          },
        ],
      });
    });
  });
});
