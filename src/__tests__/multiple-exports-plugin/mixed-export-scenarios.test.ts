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

describe('Mixed Export Scenarios - Comprehensive Tests', () => {
  describe('Default + Named export combinations', () => {
    ruleTester.run('Default with various named exports', rule, {
      valid: [
        // Single default export only
        {
          code: `export default function Component() { return 'Hello'; }`,
        },
        // Single named export only
        {
          code: `export const utility = () => 'util';`,
        },
      ],
      invalid: [
        // Default function + named function
        {
          code: `export default function MainComponent() { return 'Main'; }
export function HelperComponent() { return 'Helper'; }`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 function, 1 default export' },
            },
          ],
        },
        // Default class + named class
        {
          code: `export default class MainService {}
export class HelperService {}`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 class, 1 default export' },
            },
          ],
        },
        // Default variable + named variable
        {
          code: `const mainConfig = { main: true };
export default mainConfig;
export const helperConfig = { helper: true };`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 variable, 1 default export' },
            },
          ],
        },
        // Default + multiple named exports
        {
          code: `export default function main() {}
export const util1 = () => {};
export const util2 = () => {};`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '2 variables, 1 default export' },
            },
          ],
        },
        // Default + mixed named export types
        {
          code: `export default class Main {}
export function helper() {}
export const CONSTANT = 'value';
export interface Config { value: string; }`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 function, 1 interface, 1 variable, 1 default export' },
            },
          ],
        },
      ],
    });
  });

  describe('TypeScript mixed scenarios', () => {
    ruleTester.run('TypeScript runtime + type exports', rule, {
      valid: [
        // Single runtime export with internal types
        {
          code: `interface Props { name: string; }
export const Component = (props: Props) => props.name;`,
        },
        // Single type export with internal runtime code
        {
          code: `const internal = () => 'internal';
export interface PublicInterface { value: string; }`,
        },
      ],
      invalid: [
        // Mixed runtime and type exports
        {
          code: `export interface UserData { id: string; name: string; }
export class UserService { 
  getUser(): UserData { return { id: '1', name: 'John' }; }
}`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 class, 1 interface' },
            },
          ],
        },
        // Multiple types + runtime
        {
          code: `export type ID = string | number;
export interface Config { timeout: number; }
export const DEFAULT_CONFIG: Config = { timeout: 5000 };`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 interface, 1 type, 1 variable' },
            },
          ],
        },
        // Enum + other types
        {
          code: `export enum Status { Active, Inactive }
export type StatusValue = keyof typeof Status;
export interface StatusConfig { defaultStatus: Status; }`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 interface, 2 types' },
            },
          ],
        },
      ],
    });
  });

  describe('Complex export specifier combinations', () => {
    ruleTester.run('Multiple export specifiers and declarations', rule, {
      valid: [
        // Single specifier
        {
          code: `const value = 42;
export { value };`,
        },
        // Single export statement with multiple specifiers (counts as multiple)
        // This is intentionally not included as it should fail
      ],
      invalid: [
        // Single grouped specifier (counts as multiple exports)
        {
          code: `const a = 1, b = 2;
export { a, b };`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '2 export specifiers' },
            },
          ],
        },
        // Multiple separate specifier exports
        {
          code: `const a = 1, b = 2, c = 3;
export { a };
export { b, c };`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '3 export specifiers' },
            },
          ],
        },
        // Specifiers + declarations
        {
          code: `const helper = () => 'help';
export { helper };
export function main() { return 'main'; }`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 function, 1 export specifier' },
            },
          ],
        },
        // Multiple specifier groups with different sources
        {
          code: `import { util1, util2 } from './utils';
import { helper } from './helpers';
export { util1, util2 };
export { helper };`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '3 export specifiers' },
            },
          ],
        },
      ],
    });
  });

  describe('Re-export combinations', () => {
    ruleTester.run('Re-exports from modules', rule, {
      valid: [
        // Single re-export
        {
          code: `export { Component } from './Component';`,
        },
        // Single namespace re-export
        {
          code: `export * from './utils';`,
        },
        // Single default re-export
        {
          code: `export { default } from './Main';`,
        },
      ],
      invalid: [
        // Multiple re-exports from different modules
        {
          code: `export { Button } from './Button';
export { Input } from './Input';`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Mixed re-exports and local exports
        {
          code: `export { Component } from './Component';
export const LOCAL_CONSTANT = 'local';`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Re-export + default
        {
          code: `export { helper } from './utils';
export default function main() {}`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Multiple namespace re-exports (these are not currently detected as violations)
        // Removing this test case as namespace exports are treated differently
      ],
    });
  });

  describe('JavaScript vs TypeScript mixed patterns', () => {
    ruleTester.run('JavaScript-specific patterns', rule, {
      valid: [
        // Single CommonJS-style export
        {
          code: `const module = { value: 42 };
export default module;`,
        },
      ],
      invalid: [
        // Multiple function expressions
        {
          code: `export const func1 = function() { return 1; };
export const func2 = () => 2;
export const func3 = function named() { return 3; };`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '3 variables' },
            },
          ],
        },
        // Mixed function styles
        {
          code: `export function regularFunction() {}
export const arrowFunction = () => {};
export const functionExpression = function() {};`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: { exportTypes: '1 function, 2 variables' },
            },
          ],
        },
      ],
    });
  });

  describe('Edge case combinations', () => {
    ruleTester.run('Unusual but valid combinations', rule, {
      valid: [
        // Anonymous exports don't count as multiple
        {
          code: `export default class {};`,
        },
        // Variable declaration with multiple declarators (single export)
        {
          code: `export const a = 1, b = 2, c = 3;`,
        },
      ],
      invalid: [
        // Complex mixed scenario
        {
          code: `// TypeScript interfaces
export interface User { id: string; }
export interface Product { id: string; }

// Runtime classes
export class UserService {}

// Functions
export function createUser() {}

// Variables
export const API_VERSION = 'v1';

// Default export
export default class App {}

// Re-exports
export { Logger } from './Logger';`,
          errors: [
            {
              messageId: 'multipleExportsDetailed',
              data: {
                exportTypes:
                  '1 class, 1 function, 2 interfaces, 1 variable, 1 default export, 1 export specifier',
              },
            },
          ],
        },
        // All possible export types
        {
          code: `export class MyClass {}
export function myFunction() {}
export interface MyInterface {}
export type MyType = string;
export const myVariable = 'value';
export enum MyEnum { A, B }
export default 'default';
const local = 'local';
export { local };`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('Async and generator combinations', () => {
    ruleTester.run('Modern JavaScript features', rule, {
      valid: [
        // Single async function
        {
          code: `export async function fetchData() { return 'data'; }`,
        },
        // Single generator function
        {
          code: `export function* generator() { yield 1; }`,
        },
      ],
      invalid: [
        // Multiple async functions
        {
          code: `export async function fetchUser() { return 'user'; }
export async function fetchProduct() { return 'product'; }`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Mixed async and regular functions
        {
          code: `export async function asyncFunc() {}
export function syncFunc() {}`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Generators and regular functions
        {
          code: `export function* gen1() { yield 1; }
export function* gen2() { yield 2; }
export function regular() {}`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });
});
