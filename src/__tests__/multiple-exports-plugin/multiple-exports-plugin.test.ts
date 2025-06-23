/* eslint-disable @typescript-eslint/no-explicit-any */
import { Rule, RuleTester } from 'eslint';
import { multipleExportsPlugin } from '../../linters/multiple-exports-plugin/multiple-exports-plugin';
import { PluginConfig } from '../../types';

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

describe('multiple-exports-plugin', () => {
  describe('no-multiple-exports rule', () => {
    const rule = multipleExportsPlugin.rules['no-multiple-exports'];

    describe('with default configuration', () => {
      ruleTester.run('no-multiple-exports (default)', rule, {
        valid: [
          // Single export - function
          {
            code: 'export function myFunction() { return true; }',
          },
          // Single export - class
          {
            code: 'export class MyClass { constructor() {} }',
          },
          // Single export - interface
          {
            code: 'export interface MyInterface { value: string; }',
          },
          // Single export - type
          {
            code: 'export type MyType = string | number;',
          },
          // Single export - variable
          {
            code: 'export const myVariable = "test";',
          },
          // Single default export
          {
            code: 'export default function() { return true; }',
          },
          // Single export specifier
          {
            code: 'const value = 42; export { value };',
          },
          // Empty file
          {
            code: '',
          },
          // No exports
          {
            code: 'const value = 42; console.log(value);',
          },
        ],
        invalid: [
          // Multiple function exports
          {
            code: `export function func1() { return 1; }
export function func2() { return 2; }`,
            errors: [
              {
                messageId: 'multipleExportsDetailed',
                data: {
                  exportTypes: 'function',
                },
              },
            ],
          },
          // Multiple class exports
          {
            code: `export class Class1 {}
export class Class2 {}`,
            errors: [
              {
                messageId: 'multipleExportsDetailed',
                data: {
                  exportTypes: 'class',
                },
              },
            ],
          },
          // Mixed export types
          {
            code: `export function myFunction() { return true; }
export class MyClass {}`,
            errors: [
              {
                messageId: 'multipleExportsDetailed',
                data: {
                  exportTypes: 'function, class',
                },
              },
            ],
          },
          // Multiple export specifiers
          {
            code: `const a = 1, b = 2;
export { a, b };`,
            errors: [
              {
                messageId: 'multipleExportsDetailed',
                data: {
                  exportTypes: 'specifier',
                },
              },
            ],
          },
          // Default export + named export
          {
            code: `export default function() { return true; }
export const myVar = 42;`,
            errors: [
              {
                messageId: 'multipleExportsDetailed',
                data: {
                  exportTypes: 'default, variable',
                },
              },
            ],
          },
        ],
      });
    });

    describe('barrel file exemption', () => {
      const mockFilename = '/test/index.ts';
      const mockContext = {
        getFilename: () => mockFilename,
        options: [{ ignoreBarrelFiles: true }],
        report: jest.fn(),
      };

      beforeEach(() => {
        mockContext.report.mockClear();
      });

      test('should not report violations for barrel files (index.ts)', () => {
        const ruleInstance = rule.create(mockContext as unknown as Rule.RuleContext);

        // Simulate multiple exports in barrel file
        if (ruleInstance.ExportNamedDeclaration) {
          ruleInstance.ExportNamedDeclaration({
            type: 'ExportNamedDeclaration',
            declaration: {
              type: 'FunctionDeclaration',
              id: { name: 'func1', type: 'Identifier' },
            },
          } as any);

          ruleInstance.ExportNamedDeclaration({
            type: 'ExportNamedDeclaration',
            declaration: {
              type: 'FunctionDeclaration',
              id: { name: 'func2', type: 'Identifier' },
            },
          } as any);
        }

        if (ruleInstance['Program:exit']) {
          ruleInstance['Program:exit']({} as any);
        }
        expect(mockContext.report).not.toHaveBeenCalled();
      });
    });

    describe('configuration options', () => {
      describe('checkClasses option', () => {
        ruleTester.run('no-multiple-exports (checkClasses: false)', rule, {
          valid: [
            // Multiple class exports should be ignored
            {
              code: `export class Class1 {}
export class Class2 {}`,
              options: [{ checkClasses: false }],
            },
          ],
          invalid: [
            // Function exports should still be checked
            {
              code: `export function func1() { return 1; }
export function func2() { return 2; }`,
              options: [{ checkClasses: false }],
              errors: [
                {
                  messageId: 'multipleExportsDetailed',
                  data: {
                    exportTypes: 'function',
                  },
                },
              ],
            },
          ],
        });
      });

      describe('checkFunctions option', () => {
        ruleTester.run('no-multiple-exports (checkFunctions: false)', rule, {
          valid: [
            // Multiple function exports should be ignored
            {
              code: `export function func1() { return 1; }
export function func2() { return 2; }`,
              options: [{ checkFunctions: false }],
            },
          ],
          invalid: [
            // Class exports should still be checked
            {
              code: `export class Class1 {}
export class Class2 {}`,
              options: [{ checkFunctions: false }],
              errors: [
                {
                  messageId: 'multipleExportsDetailed',
                  data: {
                    exportTypes: 'class',
                  },
                },
              ],
            },
          ],
        });
      });

      describe('ignoreBarrelFiles option', () => {
        ruleTester.run('no-multiple-exports (ignoreBarrelFiles: false)', rule, {
          valid: [],
          invalid: [
            // Should report violations even in barrel files when option is false
            {
              code: `export function func1() { return 1; }
export function func2() { return 2; }`,
              filename: '/test/index.ts',
              options: [{ ignoreBarrelFiles: false }],
              errors: [
                {
                  messageId: 'multipleExportsDetailed',
                  data: {
                    exportTypes: 'function',
                  },
                },
              ],
            },
          ],
        });
      });
    });

    describe('edge cases', () => {
      ruleTester.run('no-multiple-exports (edge cases)', rule, {
        valid: [
          // Variable declaration with multiple declarators (counts as one export)
          {
            code: 'export const a = 1, b = 2;',
          },
          // Anonymous default exports
          {
            code: 'export default class {};',
          },
          {
            code: 'export default function() {};',
          },
          {
            code: 'export default 42;',
          },
        ],
        invalid: [
          // Multiple variable declarations
          {
            code: `export const a = 1;
export const b = 2;`,
            errors: [
              {
                messageId: 'multipleExportsDetailed',
                data: {
                  exportTypes: 'variable',
                },
              },
            ],
          },
        ],
      });
    });
  });

  describe('plugin configurations', () => {
    describe('recommended configuration', () => {
      test('should have correct rule configuration', () => {
        expect(multipleExportsPlugin.configs).toBeDefined();
        if (!multipleExportsPlugin.configs) return;

        const recommendedConfig = multipleExportsPlugin.configs.recommended as PluginConfig;

        expect(recommendedConfig.rules['multiple-exports/no-multiple-exports']).toEqual([
          'warn',
          {
            checkClasses: true,
            checkFunctions: true,
            checkInterfaces: true,
            checkTypes: true,
            checkVariables: true,
            ignoreBarrelFiles: true,
          },
        ]);
      });
    });

    describe('strict configuration', () => {
      test('should have correct rule configuration', () => {
        expect(multipleExportsPlugin.configs).toBeDefined();
        if (!multipleExportsPlugin.configs) return;

        const strictConfig = multipleExportsPlugin.configs.strict as PluginConfig;

        expect(strictConfig.rules['multiple-exports/no-multiple-exports']).toEqual([
          'error',
          {
            checkClasses: true,
            checkFunctions: true,
            checkInterfaces: true,
            checkTypes: true,
            checkVariables: true,
            ignoreBarrelFiles: true,
          },
        ]);
      });
    });

    describe('plugin structure', () => {
      test('should export the rule', () => {
        expect(multipleExportsPlugin.rules).toHaveProperty('no-multiple-exports');
        expect(typeof multipleExportsPlugin.rules['no-multiple-exports']).toBe('object');
      });

      test('should have both configuration presets', () => {
        expect(multipleExportsPlugin.configs).toBeDefined();
        if (!multipleExportsPlugin.configs) return;

        expect(multipleExportsPlugin.configs).toHaveProperty('recommended');
        expect(multipleExportsPlugin.configs).toHaveProperty('strict');
        expect(typeof multipleExportsPlugin.configs.recommended).toBe('object');
        expect(typeof multipleExportsPlugin.configs.strict).toBe('object');
      });

      test('should have proper rule metadata', () => {
        const rule = multipleExportsPlugin.rules['no-multiple-exports'];

        expect(rule.meta).toBeDefined();
        if (rule.meta) {
          expect(rule.meta.type).toBe('suggestion');
          expect(rule.meta.docs).toBeDefined();
          expect(rule.meta.schema).toBeDefined();
          expect(rule.meta.messages).toBeDefined();
        }
      });
    });
  });
});
