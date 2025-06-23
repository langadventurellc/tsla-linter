import { RuleTester, Rule } from 'eslint';
import { statementCountPlugin } from '../linters/statement-count-plugin';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('statement-count-plugin', () => {
  describe('function-statement-count rule', () => {
    const rule = statementCountPlugin.rules['function-statement-count'];

    describe('with default configuration', () => {
      ruleTester.run('function-statement-count (default)', rule, {
        valid: [
          // Function with few statements
          {
            code: `function smallFunction() {
              const x = 1;
              const y = 2;
              return x + y;
            }`,
          },
          // Arrow function with few statements
          {
            code: `const smallArrow = () => {
              const x = 1;
              const y = 2;
              return x + y;
            };`,
          },
          // Function expression with few statements
          {
            code: `const smallFn = function() {
              const x = 1;
              const y = 2;
              return x + y;
            };`,
          },
          // Function with exactly 24 statements (below warn threshold)
          {
            code: `function mediumFunction() {
              ${Array.from({ length: 24 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
          },
          // Arrow function expression without block (no statements to count)
          {
            code: 'const simple = () => 42;',
          },
          // Function with nested functions (nested statements shouldn't count)
          {
            code: `function outerFunction() {
              const x = 1;
              function innerFunction() {
                const y = 2;
                const z = 3;
                return y + z;
              }
              return x + innerFunction();
            }`,
          },
        ],
        invalid: [
          // Function with 25 statements (warn threshold)
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
                  level: 'recommended max',
                },
              },
            ],
          },
          // Function with 50 statements (error threshold)
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
                  level: 'max',
                },
              },
            ],
          },
          // Arrow function with too many statements
          {
            code: `const warnArrow = () => {
              ${Array.from({ length: 25 }, (_, i) => `x${i};`).join('\n              ')}
            };`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'warnArrow',
                  count: '25',
                  threshold: '25',
                  level: 'recommended max',
                },
              },
            ],
          },
          // Function expression with too many statements
          {
            code: `const warnFn = function() {
              ${Array.from({ length: 25 }, (_, i) => `x${i};`).join('\n              ')}
            };`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'warnFn',
                  count: '25',
                  threshold: '25',
                  level: 'recommended max',
                },
              },
            ],
          },
          // Anonymous function expression
          {
            code: `const obj = {
              method: function() {
                ${Array.from({ length: 25 }, (_, i) => `x${i};`).join('\n                ')}
              }
            };`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'method',
                  count: '25',
                  threshold: '25',
                  level: 'recommended max',
                },
              },
            ],
          },
          // Truly anonymous function
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
                  level: 'recommended max',
                },
              },
            ],
          },
        ],
      });
    });

    describe('with custom configuration', () => {
      ruleTester.run('function-statement-count (custom)', rule, {
        valid: [
          // Function with 9 statements (below custom warn threshold)
          {
            code: `function smallFunction() {
              ${Array.from({ length: 9 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            options: [{ warnThreshold: 10, errorThreshold: 20 }],
          },
        ],
        invalid: [
          // Function with 10 statements (custom warn threshold)
          {
            code: `function warnFunction() {
              ${Array.from({ length: 10 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            options: [{ warnThreshold: 10, errorThreshold: 20 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'warnFunction',
                  count: '10',
                  threshold: '10',
                  level: 'recommended max',
                },
              },
            ],
          },
          // Function with 20 statements (custom error threshold)
          {
            code: `function errorFunction() {
              ${Array.from({ length: 20 }, (_, i) => `x${i};`).join('\n              ')}
            }`,
            options: [{ warnThreshold: 10, errorThreshold: 20 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'errorFunction',
                  count: '20',
                  threshold: '20',
                  level: 'max',
                },
              },
            ],
          },
        ],
      });
    });

    describe('various statement types', () => {
      ruleTester.run('function-statement-count (statement types)', rule, {
        valid: [
          // Function with mixed statement types (24 total)
          {
            code: `function mixedStatements() {
              const x = 1;                    // ExpressionStatement
              let y;                          // VariableDeclaration
              y = 2;                          // ExpressionStatement
              if (x > 0) {                    // IfStatement
                return x;                     // ReturnStatement
              }
              for (let i = 0; i < 10; i++) {  // ForStatement
                console.log(i);               // ExpressionStatement
              }
              while (y > 0) {                 // WhileStatement
                y--;                          // ExpressionStatement
              }
              do {                            // DoWhileStatement
                y++;                          // ExpressionStatement
              } while (y < 5);
              for (let j = 0; j < 5; j++) {   // ForStatement
                switch (x) {                  // SwitchStatement
                  case 1:
                    break;                    // BreakStatement
                  default:
                    continue;                 // ContinueStatement
                }
              }
              try {                           // TryStatement
                throw new Error('test');      // ThrowStatement
              } catch (e) {
                console.error(e);             // ExpressionStatement
              }
              debugger;                       // DebuggerStatement
              label: {                        // LabeledStatement
                break label;                  // BreakStatement
              }
              ;                               // EmptyStatement
              return 42;                      // ReturnStatement
            }`,
          },
        ],
        invalid: [
          // Same function but with one more statement to trigger warning
          {
            code: `function mixedStatements() {
              const x = 1;
              let y;
              y = 2;
              if (x > 0) {
                return x;
              }
              for (let i = 0; i < 10; i++) {
                console.log(i);
              }
              while (y > 0) {
                y--;
              }
              do {
                y++;
              } while (y < 5);
              for (let j = 0; j < 5; j++) {
                switch (x) {
                  case 1:
                    break;
                  default:
                    continue;
                }
              }
              try {
                throw new Error('test');
              } catch (e) {
                console.error(e);
              }
              debugger;
              label: {
                break label;
              }
              ;
              extra();
              extra2();
              extra3();
              extra4();
              return 42;
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'mixedStatements',
                  count: '25',
                  threshold: '25',
                  level: 'recommended max',
                },
              },
            ],
          },
        ],
      });
    });

    describe('edge cases', () => {
      ruleTester.run('function-statement-count (edge cases)', rule, {
        valid: [
          // Empty function
          {
            code: 'function empty() {}',
          },
          // Function with only comments
          {
            code: `function commented() {
              // This is a comment
              /* This is also a comment */
            }`,
          },
          // Function with only variable declarations (not executable statements)
          {
            code: `function declarations() {
              var x;
              let y;
              const z = undefined;
            }`,
          },
        ],
        invalid: [],
      });
    });
  });

  describe('configuration validation', () => {
    it('should throw error when warnThreshold >= errorThreshold', () => {
      expect(() => {
        const mockContext = {
          options: [{ warnThreshold: 30, errorThreshold: 30 }],
          report: jest.fn(),
        };
        statementCountPlugin.rules['function-statement-count'].create(
          mockContext as unknown as Rule.RuleContext,
        );
      }).toThrow('warnThreshold must be less than errorThreshold');

      expect(() => {
        const mockContext = {
          options: [{ warnThreshold: 40, errorThreshold: 30 }],
          report: jest.fn(),
        };
        statementCountPlugin.rules['function-statement-count'].create(
          mockContext as unknown as Rule.RuleContext,
        );
      }).toThrow('warnThreshold must be less than errorThreshold');
    });
  });
});
