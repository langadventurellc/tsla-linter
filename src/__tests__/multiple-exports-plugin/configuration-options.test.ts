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

describe('Configuration Options - Comprehensive Tests', () => {
  describe('checkClasses option', () => {
    ruleTester.run('checkClasses: false', rule, {
      valid: [
        // Multiple classes should be ignored
        {
          code: `export class Service1 {}
export class Service2 {}
export class Service3 {}`,
          options: [{ checkClasses: false }],
        },
        // Mixed with classes ignored
        {
          code: `export class Service {}
export function helper() {}`,
          options: [{ checkClasses: false }],
        },
        // Default class exports ignored
        {
          code: `export default class MainService {}
export class HelperService {}`,
          options: [{ checkClasses: false }],
        },
      ],
      invalid: [
        // Other export types should still be checked
        {
          code: `export function func1() {}
export function func2() {}`,
          options: [{ checkClasses: false }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Mixed exports with non-class types
        {
          code: `export class Service {} // This should be ignored
export interface Config {}
export type Status = string;`,
          options: [{ checkClasses: false }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });

    ruleTester.run('checkClasses: true (default)', rule, {
      valid: [],
      invalid: [
        // Classes should be checked by default
        {
          code: `export class Service1 {}
export class Service2 {}`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Explicit true option
        {
          code: `export class Service1 {}
export class Service2 {}`,
          options: [{ checkClasses: true }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('checkFunctions option', () => {
    ruleTester.run('checkFunctions: false', rule, {
      valid: [
        // Multiple functions should be ignored
        {
          code: `export function helper1() {}
export function helper2() {}
export function helper3() {}`,
          options: [{ checkFunctions: false }],
        },
        // Arrow functions are variables, so they should be checked under checkVariables, not checkFunctions
        // This test case is invalid - arrow functions are variables
        // Mixed function types ignored
        {
          code: `export function regularFunc() {}
export const arrowFunc = () => {};
export async function asyncFunc() {}
export function* generatorFunc() {}`,
          options: [{ checkFunctions: false }],
        },
        // Default function exports ignored
        {
          code: `export default function main() {}
export function helper() {}`,
          options: [{ checkFunctions: false }],
        },
      ],
      invalid: [
        // Other export types should still be checked
        {
          code: `export class Class1 {}
export class Class2 {}`,
          options: [{ checkFunctions: false }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Variables should still be checked even if functions ignored
        {
          code: `export function helper() {} // This should be ignored
export const config1 = {};
export const config2 = {};`,
          options: [{ checkFunctions: false }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('checkInterfaces option', () => {
    ruleTester.run('checkInterfaces: false', rule, {
      valid: [
        // Multiple interfaces should be ignored
        {
          code: `export interface User { id: string; }
export interface Product { id: string; }
export interface Order { id: string; }`,
          options: [{ checkInterfaces: false }],
        },
        // Mixed with interfaces ignored
        {
          code: `export interface Config { value: string; }
export class Service {}`,
          options: [{ checkInterfaces: false }],
        },
      ],
      invalid: [
        // Other types should still be checked
        {
          code: `export interface Config {} // This should be ignored
export type Status = string;
export type ID = number;`,
          options: [{ checkInterfaces: false }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('checkTypes option', () => {
    ruleTester.run('checkTypes: false', rule, {
      valid: [
        // Multiple types should be ignored
        {
          code: `export type ID = string;
export type Status = 'active' | 'inactive';
export type Config = { value: string; };`,
          options: [{ checkTypes: false }],
        },
        // Enums should be ignored (treated as types)
        {
          code: `export enum Color { Red, Green, Blue }
export enum Size { Small, Medium, Large }`,
          options: [{ checkTypes: false }],
        },
      ],
      invalid: [
        // Other exports should still be checked
        {
          code: `export type Status = string; // This should be ignored
export interface Config { value: string; }
export interface User { id: string; }`,
          options: [{ checkTypes: false }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('checkVariables option', () => {
    ruleTester.run('checkVariables: false', rule, {
      valid: [
        // Multiple variables should be ignored
        {
          code: `export const CONFIG = { value: 'test' };
export const API_URL = 'https://api.example.com';
export const VERSION = '1.0.0';`,
          options: [{ checkVariables: false }],
        },
        // Different variable types ignored
        {
          code: `export const constVar = 'const';
export let letVar = 'let';
export var varVar = 'var';`,
          options: [{ checkVariables: false }],
        },
        // Arrow function variables ignored
        {
          code: `export const func1 = () => {};
export const func2 = function() {};`,
          options: [{ checkVariables: false }],
        },
      ],
      invalid: [
        // Functions should still be checked
        {
          code: `export const helper = () => {}; // This should be ignored
export function func1() {}
export function func2() {}`,
          options: [{ checkVariables: false }],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('Multiple option combinations', () => {
    ruleTester.run('Selective checking combinations', rule, {
      valid: [
        // Only check functions
        {
          code: `export class Service {} // ignored
export interface Config {} // ignored
export type Status = string; // ignored
export const CONSTANT = 'value'; // ignored
export function helper() {} // only one function`,
          options: [
            {
              checkClasses: false,
              checkInterfaces: false,
              checkTypes: false,
              checkVariables: false,
              checkFunctions: true,
            },
          ],
        },
        // Only check classes and interfaces (but this has both, so it should fail)
        // This test case should be moved to invalid section
        // Disable all specific checks (only default behavior)
        {
          code: `export class Service1 {}
export class Service2 {}
export function helper() {}
export const CONSTANT = 'value';`,
          options: [
            {
              checkClasses: false,
              checkInterfaces: false,
              checkTypes: false,
              checkVariables: false,
              checkFunctions: false,
            },
          ],
        },
      ],
      invalid: [
        // Multiple functions when only functions checked
        {
          code: `export class Service {} // ignored
export function func1() {}
export function func2() {}`,
          options: [
            {
              checkClasses: false,
              checkInterfaces: false,
              checkTypes: false,
              checkVariables: false,
              checkFunctions: true,
            },
          ],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Multiple in allowed categories
        {
          code: `export function helper() {} // ignored
export class Service1 {}
export class Service2 {}
export interface Config1 {}
export interface Config2 {}`,
          options: [
            {
              checkClasses: true,
              checkInterfaces: true,
              checkFunctions: false,
            },
          ],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('ignoreBarrelFiles combined with other options', () => {
    ruleTester.run('Barrel file exemption with selective checking', rule, {
      valid: [
        // Barrel file with multiple functions (functions disabled)
        {
          filename: '/src/index.ts',
          code: `export function func1() {}
export function func2() {}
export function func3() {}`,
          options: [
            {
              ignoreBarrelFiles: true,
              checkFunctions: false,
            },
          ],
        },
        // Non-barrel file with functions disabled
        {
          filename: '/src/utils.ts',
          code: `export function func1() {}
export function func2() {}`,
          options: [
            {
              ignoreBarrelFiles: true,
              checkFunctions: false,
            },
          ],
        },
      ],
      invalid: [
        // Barrel file with disabled exemption and selective checking
        {
          filename: '/src/index.ts',
          code: `export function func1() {} // ignored due to checkFunctions: false
export class Service1 {}
export class Service2 {}`,
          options: [
            {
              ignoreBarrelFiles: false,
              checkFunctions: false,
              checkClasses: true,
            },
          ],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Non-barrel file with classes enabled
        {
          filename: '/src/services.ts',
          code: `export function func1() {} // ignored
export class Service1 {}
export class Service2 {}`,
          options: [
            {
              checkFunctions: false,
              checkClasses: true,
            },
          ],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('Configuration edge cases', () => {
    ruleTester.run('Invalid or extreme configurations', rule, {
      valid: [
        // All checks disabled
        {
          code: `export class A {}
export class B {}
export function c() {}
export const d = 'value';
export interface E {}
export type F = string;`,
          options: [
            {
              checkClasses: false,
              checkFunctions: false,
              checkInterfaces: false,
              checkTypes: false,
              checkVariables: false,
            },
          ],
        },
        // Empty configuration object (should use defaults)
        {
          code: `export const singleExport = 'value';`,
          options: [{}],
        },
      ],
      invalid: [
        // All checks enabled explicitly
        {
          code: `export class Service1 {}
export class Service2 {}`,
          options: [
            {
              checkClasses: true,
              checkFunctions: true,
              checkInterfaces: true,
              checkTypes: true,
              checkVariables: true,
              ignoreBarrelFiles: true,
            },
          ],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
        // Default behavior (no options)
        {
          code: `export const var1 = 'a';
export const var2 = 'b';`,
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });

  describe('TypeScript-specific configuration impacts', () => {
    ruleTester.run('TypeScript type checking options', rule, {
      valid: [
        // Type-only exports ignored when checkTypes and checkInterfaces disabled
        {
          code: `export interface User { id: string; }
export type Status = 'active' | 'inactive';
export enum Color { Red, Green, Blue }`,
          options: [
            {
              checkTypes: false,
              checkInterfaces: false,
            },
          ],
        },
        // Mixed runtime and type exports with types disabled
        {
          code: `export class UserService {} // Only runtime export
export interface UserData {} // ignored
export type UserStatus = string; // ignored`,
          options: [
            {
              checkTypes: false,
              checkInterfaces: false,
            },
          ],
        },
      ],
      invalid: [
        // Multiple runtime exports with types ignored
        {
          code: `export class Service1 {}
export class Service2 {}
export interface Config {} // ignored
export type Status = string; // ignored`,
          options: [
            {
              checkTypes: false,
              checkInterfaces: false,
            },
          ],
          errors: [{ messageId: 'multipleExportsDetailed' }],
        },
      ],
    });
  });
});
