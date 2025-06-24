import { Rule, RuleTester } from 'eslint';
import { statementCountPlugin } from '../../linters/statement-count-plugin/statement-count-plugin';
import { PluginConfig } from '../../types';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('statement-count-plugin', () => {
  describe('function-statement-count-warn rule', () => {
    const rule = statementCountPlugin.rules['function-statement-count-warn'];

    describe('with default configuration', () => {
      ruleTester.run('function-statement-count-warn (default)', rule, {
        valid: [
          // Function with few statements
          {
            code: `function smallFunction() {
              const x = 1;
              const y = 2;
              return x + y;
            }`,
          },
          // Function with exactly 24 statements (below threshold)
          {
            code: `function mediumFunction() {
              ${Array.from({ length: 24 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
          },
        ],
        invalid: [
          // Function with 25 statements (at threshold)
          {
            code: `function warnFunction() {
              ${Array.from({ length: 25 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'warnFunction',
                  count: '25',
                  threshold: '25',
                },
              },
            ],
          },
          // Anonymous function
          {
            code: `[1, 2, 3].map(function() {
              ${Array.from({ length: 25 }, (_, i) => `x${i};`).join('\n              ')}
              return 42;
            });`,
            errors: [
              {
                messageId: 'tooManyStatementsAnonymous',
                data: {
                  count: '26',
                  threshold: '25',
                },
              },
            ],
          },
        ],
      });
    });

    describe('with custom configuration', () => {
      ruleTester.run('function-statement-count-warn (custom)', rule, {
        valid: [
          {
            code: `function smallFunction() {
              ${Array.from({ length: 9 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            options: [{ threshold: 10 }],
          },
        ],
        invalid: [
          {
            code: `function warnFunction() {
              ${Array.from({ length: 10 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            options: [{ threshold: 10 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'warnFunction',
                  count: '10',
                  threshold: '10',
                },
              },
            ],
          },
        ],
      });
    });

    describe('configuration validation', () => {
      it('should throw error when threshold is not positive', () => {
        expect(() => {
          const mockContext = {
            options: [{ threshold: 0 }],
            report: jest.fn(),
          };
          rule.create(mockContext as unknown as Rule.RuleContext);
        }).toThrow('threshold must be a positive integer');

        expect(() => {
          const mockContext = {
            options: [{ threshold: -1 }],
            report: jest.fn(),
          };
          rule.create(mockContext as unknown as Rule.RuleContext);
        }).toThrow('threshold must be a positive integer');
      });
    });
  });

  describe('function-statement-count-error rule', () => {
    const rule = statementCountPlugin.rules['function-statement-count-error'];

    describe('with default configuration', () => {
      ruleTester.run('function-statement-count-error (default)', rule, {
        valid: [
          // Function with 49 statements (below threshold)
          {
            code: `function mediumFunction() {
              ${Array.from({ length: 49 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
          },
        ],
        invalid: [
          // Function with 50 statements (at threshold)
          {
            code: `function errorFunction() {
              ${Array.from({ length: 50 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'errorFunction',
                  count: '50',
                  threshold: '50',
                },
              },
            ],
          },
        ],
      });
    });

    describe('with custom configuration', () => {
      ruleTester.run('function-statement-count-error (custom)', rule, {
        valid: [
          {
            code: `function smallFunction() {
              ${Array.from({ length: 19 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            options: [{ threshold: 20 }],
          },
        ],
        invalid: [
          {
            code: `function errorFunction() {
              ${Array.from({ length: 20 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            options: [{ threshold: 20 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'errorFunction',
                  count: '20',
                  threshold: '20',
                },
              },
            ],
          },
        ],
      });
    });

    describe('configuration validation', () => {
      it('should throw error when threshold is not positive', () => {
        expect(() => {
          const mockContext = {
            options: [{ threshold: 0 }],
            report: jest.fn(),
          };
          rule.create(mockContext as unknown as Rule.RuleContext);
        }).toThrow('threshold must be a positive integer');
      });
    });
  });

  describe('class-statement-count-warn rule', () => {
    const rule = statementCountPlugin.rules['class-statement-count-warn'];

    describe('with default configuration', () => {
      ruleTester.run('class-statement-count-warn (default)', rule, {
        valid: [
          // Simple class with few methods
          {
            code: `class SmallClass {
              constructor() {
                this.value = 1;
              }
              
              getValue() {
                return this.value;
              }
            }`,
          },
          // Empty class
          {
            code: 'class EmptyClass {}',
          },
        ],
        invalid: [
          // Class with 200 statements (at threshold)
          {
            code: `class LargeClass {
              constructor() {
                ${Array.from({ length: 50 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 50 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
              
              method2() {
                ${Array.from({ length: 50 }, (_, i) => `this.value${i} = ${i};`).join('\n                ')}
              }
              
              method3() {
                ${Array.from({ length: 50 }, (_, i) => `const x${i} = ${i};`).join('\n                ')}
              }
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'LargeClass',
                  count: '200',
                  threshold: '200',
                },
              },
            ],
          },
        ],
      });
    });

    describe('with custom configuration', () => {
      ruleTester.run('class-statement-count-warn (custom)', rule, {
        valid: [
          {
            code: `class SmallClass {
              constructor() {
                ${Array.from({ length: 24 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 25 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            }`,
            options: [{ threshold: 50 }],
          },
        ],
        invalid: [
          {
            code: `class WarnClass {
              constructor() {
                ${Array.from({ length: 25 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 25 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            }`,
            options: [{ threshold: 50 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'WarnClass',
                  count: '50',
                  threshold: '50',
                },
              },
            ],
          },
        ],
      });
    });

    describe('configuration validation', () => {
      it('should throw error when threshold is not positive', () => {
        expect(() => {
          const mockContext = {
            options: [{ threshold: 0 }],
            report: jest.fn(),
          };
          rule.create(mockContext as unknown as Rule.RuleContext);
        }).toThrow('threshold must be a positive integer');
      });
    });
  });

  describe('class-statement-count-error rule', () => {
    const rule = statementCountPlugin.rules['class-statement-count-error'];

    describe('with default configuration', () => {
      ruleTester.run('class-statement-count-error (default)', rule, {
        valid: [
          // Class with 299 statements (below threshold)
          {
            code: `class MediumClass {
              constructor() {
                ${Array.from({ length: 99 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 100 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
              
              method2() {
                ${Array.from({ length: 100 }, (_, i) => `this.value${i} = ${i};`).join('\n                ')}
              }
            }`,
          },
        ],
        invalid: [
          // Class with 300 statements (at threshold)
          {
            code: `class HugeClass {
              constructor() {
                ${Array.from({ length: 100 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 100 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
              
              method2() {
                ${Array.from({ length: 100 }, (_, i) => `this.value${i} = ${i};`).join('\n                ')}
              }
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'HugeClass',
                  count: '300',
                  threshold: '300',
                },
              },
            ],
          },
        ],
      });
    });

    describe('with custom configuration', () => {
      ruleTester.run('class-statement-count-error (custom)', rule, {
        valid: [
          {
            code: `class SmallClass {
              constructor() {
                ${Array.from({ length: 49 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 50 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            }`,
            options: [{ threshold: 100 }],
          },
        ],
        invalid: [
          {
            code: `class ErrorClass {
              constructor() {
                ${Array.from({ length: 50 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 50 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            }`,
            options: [{ threshold: 100 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'ErrorClass',
                  count: '100',
                  threshold: '100',
                },
              },
            ],
          },
        ],
      });
    });

    describe('configuration validation', () => {
      it('should throw error when threshold is not positive', () => {
        expect(() => {
          const mockContext = {
            options: [{ threshold: 0 }],
            report: jest.fn(),
          };
          rule.create(mockContext as unknown as Rule.RuleContext);
        }).toThrow('threshold must be a positive integer');
      });
    });
  });

  describe('plugin configurations', () => {
    describe('recommended configuration', () => {
      test('should have correct rule configurations', () => {
        expect(statementCountPlugin.configs).toBeDefined();
        if (!statementCountPlugin.configs) return;

        const recommendedConfig = statementCountPlugin.configs.recommended as PluginConfig;

        expect(recommendedConfig.rules['statement-count/function-statement-count-warn']).toEqual([
          'warn',
          { threshold: 25 },
        ]);
        expect(recommendedConfig.rules['statement-count/function-statement-count-error']).toEqual([
          'error',
          { threshold: 50 },
        ]);
        expect(recommendedConfig.rules['statement-count/class-statement-count-warn']).toEqual([
          'warn',
          { threshold: 200 },
        ]);
        expect(recommendedConfig.rules['statement-count/class-statement-count-error']).toEqual([
          'error',
          { threshold: 300 },
        ]);
      });
    });

    describe('strict configuration', () => {
      test('should have correct rule configurations', () => {
        expect(statementCountPlugin.configs).toBeDefined();
        if (!statementCountPlugin.configs) return;

        const strictConfig = statementCountPlugin.configs.strict as PluginConfig;

        expect(strictConfig.rules['statement-count/function-statement-count-warn']).toEqual([
          'warn',
          { threshold: 15 },
        ]);
        expect(strictConfig.rules['statement-count/function-statement-count-error']).toEqual([
          'error',
          { threshold: 25 },
        ]);
        expect(strictConfig.rules['statement-count/class-statement-count-warn']).toEqual([
          'warn',
          { threshold: 150 },
        ]);
        expect(strictConfig.rules['statement-count/class-statement-count-error']).toEqual([
          'error',
          { threshold: 200 },
        ]);
      });
    });

    describe('plugin structure', () => {
      test('should export all four rules', () => {
        expect(statementCountPlugin.rules).toHaveProperty('function-statement-count-warn');
        expect(statementCountPlugin.rules).toHaveProperty('function-statement-count-error');
        expect(statementCountPlugin.rules).toHaveProperty('class-statement-count-warn');
        expect(statementCountPlugin.rules).toHaveProperty('class-statement-count-error');

        expect(typeof statementCountPlugin.rules['function-statement-count-warn']).toBe('object');
        expect(typeof statementCountPlugin.rules['function-statement-count-error']).toBe('object');
        expect(typeof statementCountPlugin.rules['class-statement-count-warn']).toBe('object');
        expect(typeof statementCountPlugin.rules['class-statement-count-error']).toBe('object');
      });

      test('should have both configuration presets', () => {
        expect(statementCountPlugin.configs).toBeDefined();
        if (!statementCountPlugin.configs) return;

        expect(statementCountPlugin.configs).toHaveProperty('recommended');
        expect(statementCountPlugin.configs).toHaveProperty('strict');
        expect(typeof statementCountPlugin.configs.recommended).toBe('object');
        expect(typeof statementCountPlugin.configs.strict).toBe('object');
      });

      test('should have proper rule metadata', () => {
        const functionWarnRule = statementCountPlugin.rules['function-statement-count-warn'];
        const functionErrorRule = statementCountPlugin.rules['function-statement-count-error'];
        const classWarnRule = statementCountPlugin.rules['class-statement-count-warn'];
        const classErrorRule = statementCountPlugin.rules['class-statement-count-error'];

        [functionWarnRule, functionErrorRule, classWarnRule, classErrorRule].forEach((rule) => {
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
});
