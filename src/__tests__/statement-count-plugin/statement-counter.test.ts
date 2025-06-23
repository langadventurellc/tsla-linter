import * as ESTree from 'estree';
import {
  StatementCounter,
  countStatementsInClass,
  countStatementsInFunction,
} from '../../linters/statement-count-plugin/statement-counter';

describe('StatementCounter', () => {
  let counter: StatementCounter;

  beforeEach(() => {
    counter = new StatementCounter();
  });

  // Helper function to create mock nodes
  const createMockNode = (type: string, children?: ESTree.Node[]): ESTree.Node =>
    ({
      type,
      ...(children && { body: children }),
    }) as ESTree.Node;

  describe('Basic Statement Counting', () => {
    test('counts expression statements', () => {
      const functionBody = createMockNode('BlockStatement', [
        createMockNode('ExpressionStatement'),
        createMockNode('ExpressionStatement'),
        createMockNode('ExpressionStatement'),
      ]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(3);
      expect(result.details.statementTypes.ExpressionStatement).toBe(3);
    });

    test('counts return statements', () => {
      const functionBody = createMockNode('BlockStatement', [createMockNode('ReturnStatement')]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(1);
      expect(result.details.statementTypes.ReturnStatement).toBe(1);
    });

    test('counts control flow statements', () => {
      const functionBody = createMockNode('BlockStatement', [
        createMockNode('IfStatement', [
          createMockNode('BlockStatement', [createMockNode('ExpressionStatement')]),
        ]),
        createMockNode('ForStatement', [
          createMockNode('BlockStatement', [createMockNode('ExpressionStatement')]),
        ]),
        createMockNode('WhileStatement', [
          createMockNode('BlockStatement', [createMockNode('BreakStatement')]),
        ]),
      ]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(6); // if, for, expression in for, while, break, expression in if
      expect(result.details.statementTypes.IfStatement).toBe(1);
      expect(result.details.statementTypes.ForStatement).toBe(1);
      expect(result.details.statementTypes.WhileStatement).toBe(1);
      expect(result.details.statementTypes.ExpressionStatement).toBe(2);
      expect(result.details.statementTypes.BreakStatement).toBe(1);
    });
  });

  describe('Excluded Statements', () => {
    test('does not count variable declarations without init', () => {
      const functionBody = createMockNode('BlockStatement', [
        createMockNode('VariableDeclaration'),
        createMockNode('VariableDeclaration'),
        createMockNode('ExpressionStatement'),
      ]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(1); // Only expression statement
      expect(result.details.statementTypes.ExpressionStatement).toBe(1);
    });

    test('does not count function declarations', () => {
      const functionBody = createMockNode('BlockStatement', [
        createMockNode('FunctionDeclaration'),
        createMockNode('ExpressionStatement'),
      ]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(1); // Only expression statement
    });

    test('does not count nested function statements', () => {
      const nestedFunction = createMockNode('FunctionDeclaration', [
        createMockNode('BlockStatement', [
          createMockNode('ExpressionStatement'),
          createMockNode('ExpressionStatement'),
        ]),
      ]);

      const functionBody = createMockNode('BlockStatement', [
        createMockNode('ExpressionStatement'),
        nestedFunction,
        createMockNode('ExpressionStatement'),
      ]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(2); // Only outer statements
    });
  });

  describe('Complex Statement Types', () => {
    test('counts try-catch statements', () => {
      const tryStatement = createMockNode('TryStatement');
      (tryStatement as unknown as Record<string, unknown>).block = createMockNode(
        'BlockStatement',
        [createMockNode('ExpressionStatement')],
      );
      (tryStatement as unknown as Record<string, unknown>).handler = {
        type: 'CatchClause',
        body: createMockNode('BlockStatement', [createMockNode('ExpressionStatement')]),
      };

      const functionBody = createMockNode('BlockStatement', [tryStatement]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(3); // try, expression in try, expression in catch
      expect(result.details.statementTypes.TryStatement).toBe(1);
      expect(result.details.statementTypes.ExpressionStatement).toBe(2);
    });

    test('counts switch statements', () => {
      const switchStatement = createMockNode('SwitchStatement');
      (switchStatement as unknown as Record<string, unknown>).cases = [
        {
          type: 'SwitchCase',
          consequent: [createMockNode('ExpressionStatement'), createMockNode('BreakStatement')],
        },
        {
          type: 'SwitchCase',
          consequent: [createMockNode('ExpressionStatement')],
        },
      ];

      const functionBody = createMockNode('BlockStatement', [switchStatement]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(4); // switch, 2 expressions, 1 break
      expect(result.details.statementTypes.SwitchStatement).toBe(1);
      expect(result.details.statementTypes.ExpressionStatement).toBe(2);
      expect(result.details.statementTypes.BreakStatement).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty function body', () => {
      const functionBody = createMockNode('BlockStatement', []);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(0);
    });

    test('handles deeply nested statements', () => {
      const innerIf = createMockNode('IfStatement');
      (innerIf as unknown as Record<string, unknown>).consequent = createMockNode(
        'BlockStatement',
        [createMockNode('ExpressionStatement')],
      );

      const middleIf = createMockNode('IfStatement');
      (middleIf as unknown as Record<string, unknown>).consequent = createMockNode(
        'BlockStatement',
        [innerIf],
      );

      const outerIf = createMockNode('IfStatement');
      (outerIf as unknown as Record<string, unknown>).consequent = createMockNode(
        'BlockStatement',
        [middleIf],
      );

      const functionBody = createMockNode('BlockStatement', [outerIf]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(4); // 3 if statements + 1 expression
      expect(result.details.statementTypes.IfStatement).toBe(3);
      expect(result.details.statementTypes.ExpressionStatement).toBe(1);
    });

    test('handles arrow functions correctly (excludes nested)', () => {
      const arrowFunction = createMockNode('ArrowFunctionExpression');
      (arrowFunction as unknown as Record<string, unknown>).body = createMockNode(
        'BlockStatement',
        [createMockNode('ExpressionStatement')],
      );

      const variableDeclaration = createMockNode('VariableDeclaration');
      (variableDeclaration as unknown as Record<string, unknown>).declarations = [
        {
          type: 'VariableDeclarator',
          init: arrowFunction,
        },
      ];

      const functionBody = createMockNode('BlockStatement', [
        variableDeclaration,
        createMockNode('ExpressionStatement'),
      ]);

      const result = counter.countStatements(functionBody);
      expect(result.count).toBe(2); // Variable declaration with init + expression statement
    });
  });

  describe('countStatementsInFunction helper', () => {
    test('provides function name in result', () => {
      const functionBody = createMockNode('BlockStatement', [
        createMockNode('ExpressionStatement'),
      ]);

      const result = countStatementsInFunction(functionBody, 'testFunction');
      expect(result.details.location).toBe('testFunction');
      expect(result.count).toBe(1);
    });

    test('handles anonymous functions', () => {
      const functionBody = createMockNode('BlockStatement', [
        createMockNode('ExpressionStatement'),
      ]);

      const result = countStatementsInFunction(functionBody);
      expect(result.details.location).toBe('anonymous');
    });
  });

  describe('countStatementsInClass helper', () => {
    test('counts statements across all class methods', () => {
      const method1 = {
        type: 'MethodDefinition',
        key: { name: 'method1' },
        value: {
          body: createMockNode('BlockStatement', [
            createMockNode('ExpressionStatement'),
            createMockNode('ReturnStatement'),
          ]),
        },
      };

      const method2 = {
        type: 'MethodDefinition',
        key: { name: 'method2' },
        value: {
          body: createMockNode('BlockStatement', [createMockNode('ExpressionStatement')]),
        },
      };

      const classNode = createMockNode('ClassDeclaration');
      (classNode as unknown as Record<string, unknown>).body = {
        type: 'ClassBody',
        body: [method1, method2],
      };

      const result = countStatementsInClass(classNode, 'TestClass');
      expect(result.count).toBe(3); // 2 expressions + 1 return
      expect(result.details.location).toBe('TestClass');
      expect(result.details.statementTypes.ExpressionStatement).toBe(2);
      expect(result.details.statementTypes.ReturnStatement).toBe(1);
    });

    test('handles empty class', () => {
      const classNode = createMockNode('ClassDeclaration');
      (classNode as unknown as Record<string, unknown>).body = {
        type: 'ClassBody',
        body: [],
      };

      const result = countStatementsInClass(classNode, 'TestClass');
      expect(result.count).toBe(0);
    });

    test('handles constructor and static methods', () => {
      const constructor = {
        type: 'MethodDefinition',
        kind: 'constructor',
        key: { name: 'constructor' },
        value: {
          body: createMockNode('BlockStatement', [createMockNode('ExpressionStatement')]),
        },
      };

      const staticMethod = {
        type: 'MethodDefinition',
        static: true,
        key: { name: 'staticMethod' },
        value: {
          body: createMockNode('BlockStatement', [createMockNode('ExpressionStatement')]),
        },
      };

      const classNode = createMockNode('ClassDeclaration');
      (classNode as unknown as Record<string, unknown>).body = {
        type: 'ClassBody',
        body: [constructor, staticMethod],
      };

      const result = countStatementsInClass(classNode, 'TestClass');
      expect(result.count).toBe(2); // 2 expressions
    });
  });
});
