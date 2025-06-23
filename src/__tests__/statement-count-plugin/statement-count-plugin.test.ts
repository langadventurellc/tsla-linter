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
                  count: '28',
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

  describe('class-statement-count rule', () => {
    const classRule = statementCountPlugin.rules['class-statement-count'];

    describe('with default configuration', () => {
      ruleTester.run('class-statement-count (default)', classRule, {
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
              
              setValue(newValue) {
                this.value = newValue;
              }
            }`,
          },
          // Class with various method types but under threshold
          {
            code: `class MediumClass {
              constructor(name) {
                this.name = name;
                this.items = [];
              }
              
              static create(name) {
                return new MediumClass(name);
              }
              
              get itemCount() {
                return this.items.length;
              }
              
              set itemCount(value) {
                if (value > 0) {
                  this.items = new Array(value).fill(null);
                }
              }
              
              addItem(item) {
                this.items.push(item);
                return this.items.length;
              }
              
              removeItem(index) {
                if (index >= 0 && index < this.items.length) {
                  return this.items.splice(index, 1)[0];
                }
                return null;
              }
            }`,
          },
          // Class expression with few methods
          {
            code: `const MyClass = class {
              constructor() {
                this.data = {};
              }
              
              getData(key) {
                return this.data[key];
              }
              
              setData(key, value) {
                this.data[key] = value;
              }
            };`,
          },
          // Empty class
          {
            code: 'class EmptyClass {}',
          },
        ],
        invalid: [
          // Class with many methods exceeding warn threshold (200)
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
                ${Array.from({ length: 51 }, (_, i) => `const x${i} = ${i};`).join('\n                ')}
              }
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'LargeClass',
                  count: '201',
                  threshold: '200',
                  level: 'recommended max',
                },
              },
            ],
          },
          // Class exceeding error threshold (300)
          {
            code: `class HugeClass {
              constructor() {
                ${Array.from({ length: 100 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 100 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
              
              method2() {
                ${Array.from({ length: 101 }, (_, i) => `this.value${i} = ${i};`).join('\n                ')}
              }
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'HugeClass',
                  count: '301',
                  threshold: '300',
                  level: 'max',
                },
              },
            ],
          },
          // Class expression with too many statements
          {
            code: `const BigClass = class {
              constructor() {
                ${Array.from({ length: 100 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 101 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            };`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'BigClass',
                  count: '201',
                  threshold: '200',
                  level: 'recommended max',
                },
              },
            ],
          },
          // Anonymous class expression
          {
            code: `const obj = {
              factory: class {
                constructor() {
                  ${Array.from({ length: 100 }, (_, i) => `this.prop${i} = ${i};`).join('\n                  ')}
                }
                
                method1() {
                  ${Array.from({ length: 101 }, (_, i) => `console.log(${i});`).join('\n                  ')}
                }
              }
            };`,
            errors: [
              {
                messageId: 'tooManyStatementsAnonymous',
                data: {
                  count: '201',
                  threshold: '200',
                  level: 'recommended max',
                },
              },
            ],
          },
        ],
      });
    });

    describe('with custom configuration', () => {
      ruleTester.run('class-statement-count (custom)', classRule, {
        valid: [
          // Class with 49 statements (below custom warn threshold)
          {
            code: `class SmallClass {
              constructor() {
                ${Array.from({ length: 24 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 25 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            }`,
            options: [{ warnThreshold: 50, errorThreshold: 100 }],
          },
        ],
        invalid: [
          // Class with 50 statements (custom warn threshold)
          {
            code: `class WarnClass {
              constructor() {
                ${Array.from({ length: 25 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 25 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            }`,
            options: [{ warnThreshold: 50, errorThreshold: 100 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'WarnClass',
                  count: '50',
                  threshold: '50',
                  level: 'recommended max',
                },
              },
            ],
          },
          // Class with 100 statements (custom error threshold)
          {
            code: `class ErrorClass {
              constructor() {
                ${Array.from({ length: 50 }, (_, i) => `this.prop${i} = ${i};`).join('\n                ')}
              }
              
              method1() {
                ${Array.from({ length: 50 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
            }`,
            options: [{ warnThreshold: 50, errorThreshold: 100 }],
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'ErrorClass',
                  count: '100',
                  threshold: '100',
                  level: 'max',
                },
              },
            ],
          },
        ],
      });
    });

    describe('various class constructs', () => {
      ruleTester.run('class-statement-count (constructs)', classRule, {
        valid: [
          // Class with all types of methods
          {
            code: `class ComplexClass {
              constructor(name) {
                this.name = name;
                this.data = new Map();
              }
              
              static createEmpty() {
                return new ComplexClass('empty');
              }
              
              static validateName(name) {
                return typeof name === 'string' && name.length > 0;
              }
              
              get name() {
                return this._name;
              }
              
              set name(value) {
                if (ComplexClass.validateName(value)) {
                  this._name = value;
                }
              }
              
              getData(key) {
                return this.data.get(key);
              }
              
              setData(key, value) {
                this.data.set(key, value);
                return this;
              }
              
              async loadData() {
                const response = await fetch('/api/data');
                const data = await response.json();
                this.data = new Map(Object.entries(data));
              }
              
              *iterateData() {
                for (const [key, value] of this.data) {
                  yield { key, value };
                }
              }
            }`,
          },
        ],
        invalid: [
          // Same class but with more statements to trigger warning
          {
            code: `class ComplexClass {
              constructor(name) {
                this.name = name;
                this.data = new Map();
                ${Array.from({ length: 95 }, (_, i) => `this.extra${i} = ${i};`).join('\n                ')}
              }
              
              static createEmpty() {
                return new ComplexClass('empty');
              }
              
              static validateName(name) {
                return typeof name === 'string' && name.length > 0;
              }
              
              get name() {
                return this._name;
              }
              
              set name(value) {
                if (ComplexClass.validateName(value)) {
                  this._name = value;
                }
              }
              
              getData(key) {
                return this.data.get(key);
              }
              
              setData(key, value) {
                this.data.set(key, value);
                return this;
              }
              
              async loadData() {
                const response = await fetch('/api/data');
                const data = await response.json();
                this.data = new Map(Object.entries(data));
                ${Array.from({ length: 95 }, (_, i) => `console.log(${i});`).join('\n                ')}
              }
              
              *iterateData() {
                for (const [key, value] of this.data) {
                  yield { key, value };
                }
                ${Array.from({ length: 95 }, (_, i) => `const temp${i} = ${i};`).join('\n                ')}
              }
            }`,
            errors: [
              {
                messageId: 'tooManyStatements',
                data: {
                  name: 'ComplexClass',
                  count: '300',
                  threshold: '300',
                  level: 'max',
                },
              },
            ],
          },
        ],
      });
    });

    describe('edge cases', () => {
      ruleTester.run('class-statement-count (edge cases)', classRule, {
        valid: [
          // Empty class
          {
            code: 'class Empty {}',
          },
          // Class with only empty methods
          {
            code: `class EmptyMethods {
              constructor() {}
              method1() {}
              method2() {}
              static staticMethod() {}
              get value() { return undefined; }
              set value(v) {}
            }`,
          },
          // Class with nested classes (nested statements shouldn't count)
          {
            code: `class OuterClass {
              constructor() {
                this.value = 1;
              }
              
              createInner() {
                class InnerClass {
                  constructor() {
                    ${Array.from({ length: 50 }, (_, i) => `this.prop${i} = ${i};`).join('\n                    ')}
                  }
                  
                  method() {
                    ${Array.from({ length: 50 }, (_, i) => `console.log(${i});`).join('\n                    ')}
                  }
                }
                return new InnerClass();
              }
            }`,
          },
          // Class with inheritance
          {
            code: `class BaseClass {
              constructor(name) {
                this.name = name;
              }
              
              getName() {
                return this.name;
              }
            }
            
            class DerivedClass extends BaseClass {
              constructor(name, value) {
                super(name);
                this.value = value;
              }
              
              getValue() {
                return this.value;
              }
              
              getFullInfo() {
                return \`\${this.getName()}: \${this.getValue()}\`;
              }
            }`,
          },
        ],
        invalid: [],
      });
    });
  });

  describe('configuration validation', () => {
    it('should throw error when warnThreshold >= errorThreshold for function rule', () => {
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

    it('should throw error when warnThreshold >= errorThreshold for class rule', () => {
      expect(() => {
        const mockContext = {
          options: [{ warnThreshold: 250, errorThreshold: 250 }],
          report: jest.fn(),
        };
        statementCountPlugin.rules['class-statement-count'].create(
          mockContext as unknown as Rule.RuleContext,
        );
      }).toThrow('warnThreshold must be less than errorThreshold');

      expect(() => {
        const mockContext = {
          options: [{ warnThreshold: 300, errorThreshold: 200 }],
          report: jest.fn(),
        };
        statementCountPlugin.rules['class-statement-count'].create(
          mockContext as unknown as Rule.RuleContext,
        );
      }).toThrow('warnThreshold must be less than errorThreshold');
    });
  });

  describe('plugin configurations', () => {
    describe('recommended configuration', () => {
      test('should have correct rule configurations', () => {
        expect(statementCountPlugin.configs).toBeDefined();
        if (!statementCountPlugin.configs) return;

        const recommendedConfig = statementCountPlugin.configs.recommended as PluginConfig;

        expect(recommendedConfig.rules['statement-count/function-statement-count']).toEqual([
          'warn',
          { warnThreshold: 25, errorThreshold: 50 },
        ]);
        expect(recommendedConfig.rules['statement-count/class-statement-count']).toEqual([
          'warn',
          { warnThreshold: 200, errorThreshold: 300 },
        ]);
      });

      test('should validate recommended function thresholds', () => {
        if (!statementCountPlugin.configs) return;

        const recommendedConfig = statementCountPlugin.configs.recommended as PluginConfig;
        const config = recommendedConfig.rules['statement-count/function-statement-count'];

        expect(config).toEqual(['warn', { warnThreshold: 25, errorThreshold: 50 }]);
        expect((config[1] as { warnThreshold: number }).warnThreshold).toBe(25);
        expect((config[1] as { errorThreshold: number }).errorThreshold).toBe(50);
      });

      test('should validate recommended class thresholds', () => {
        if (!statementCountPlugin.configs) return;

        const recommendedConfig = statementCountPlugin.configs.recommended as PluginConfig;
        const config = recommendedConfig.rules['statement-count/class-statement-count'];

        expect(config).toEqual(['warn', { warnThreshold: 200, errorThreshold: 300 }]);
        expect((config[1] as { warnThreshold: number }).warnThreshold).toBe(200);
        expect((config[1] as { errorThreshold: number }).errorThreshold).toBe(300);
      });
    });

    describe('strict configuration', () => {
      test('should have correct rule configurations', () => {
        expect(statementCountPlugin.configs).toBeDefined();
        if (!statementCountPlugin.configs) return;

        const strictConfig = statementCountPlugin.configs.strict as PluginConfig;

        expect(strictConfig.rules['statement-count/function-statement-count']).toEqual([
          'error',
          { warnThreshold: 15, errorThreshold: 25 },
        ]);
        expect(strictConfig.rules['statement-count/class-statement-count']).toEqual([
          'error',
          { warnThreshold: 150, errorThreshold: 200 },
        ]);
      });

      test('should validate strict function thresholds', () => {
        if (!statementCountPlugin.configs) return;

        const strictConfig = statementCountPlugin.configs.strict as PluginConfig;
        const config = strictConfig.rules['statement-count/function-statement-count'];

        expect(config).toEqual(['error', { warnThreshold: 15, errorThreshold: 25 }]);
        expect((config[1] as { warnThreshold: number }).warnThreshold).toBe(15);
        expect((config[1] as { errorThreshold: number }).errorThreshold).toBe(25);
      });

      test('should validate strict class thresholds', () => {
        if (!statementCountPlugin.configs) return;

        const strictConfig = statementCountPlugin.configs.strict as PluginConfig;
        const config = strictConfig.rules['statement-count/class-statement-count'];

        expect(config).toEqual(['error', { warnThreshold: 150, errorThreshold: 200 }]);
        expect((config[1] as { warnThreshold: number }).warnThreshold).toBe(150);
        expect((config[1] as { errorThreshold: number }).errorThreshold).toBe(200);
      });
    });

    describe('plugin structure', () => {
      test('should export both rules', () => {
        expect(statementCountPlugin.rules).toHaveProperty('function-statement-count');
        expect(statementCountPlugin.rules).toHaveProperty('class-statement-count');
        expect(typeof statementCountPlugin.rules['function-statement-count']).toBe('object');
        expect(typeof statementCountPlugin.rules['class-statement-count']).toBe('object');
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
        const functionRule = statementCountPlugin.rules['function-statement-count'];
        const classRule = statementCountPlugin.rules['class-statement-count'];

        expect(functionRule.meta).toBeDefined();
        if (functionRule.meta) {
          expect(functionRule.meta.type).toBe('suggestion');
          expect(functionRule.meta.docs).toBeDefined();
          expect(functionRule.meta.schema).toBeDefined();
          expect(functionRule.meta.messages).toBeDefined();
        }

        expect(classRule.meta).toBeDefined();
        if (classRule.meta) {
          expect(classRule.meta.type).toBe('suggestion');
          expect(classRule.meta.docs).toBeDefined();
          expect(classRule.meta.schema).toBeDefined();
          expect(classRule.meta.messages).toBeDefined();
        }
      });
    });
  });
});
