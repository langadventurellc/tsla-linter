import {
  countStatementsInFunction,
  countStatementsInClass,
} from '../../linters/statement-count-plugin/statement-counter';
import * as ESTree from 'estree';

/**
 * Integration test to validate that StatementCounter logic remains unchanged
 * after the rule refactoring. This test ensures backward compatibility and
 * validates that the core counting functionality works correctly.
 */
describe('StatementCounter Logic Validation', () => {
  describe('5.3 StatementCounter consistency validation', () => {
    // Helper function to create a simple function body AST node for testing
    function createFunctionBody(statements: ESTree.Statement[]): ESTree.BlockStatement {
      return {
        type: 'BlockStatement',
        body: statements,
      };
    }

    // Helper function to create variable declaration
    function createVariableDeclaration(
      name: string,
      hasInit: boolean = true,
    ): ESTree.VariableDeclaration {
      return {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name },
            init: hasInit ? { type: 'Literal', value: 1 } : null,
          },
        ],
        kind: 'const',
      };
    }

    // Helper function to create return statement
    function createReturnStatement(): ESTree.ReturnStatement {
      return {
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'x' },
      };
    }

    // Helper function to create expression statement
    function createExpressionStatement(): ESTree.ExpressionStatement {
      return {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
      };
    }

    // Helper function to create if statement
    function createIfStatement(): ESTree.IfStatement {
      return {
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: {
          type: 'BlockStatement',
          body: [createExpressionStatement()],
        },
        alternate: null,
      };
    }

    // Helper function to create a simple class AST node
    function createClassNode(methods: number = 1): ESTree.ClassDeclaration {
      const methodBodies = Array.from({ length: methods }, (_, i) => ({
        type: 'MethodDefinition' as const,
        key: { type: 'Identifier' as const, name: `method${i}` },
        value: {
          type: 'FunctionExpression' as const,
          id: null,
          params: [],
          body: createFunctionBody([createVariableDeclaration(`var${i}`), createReturnStatement()]),
        },
        kind: 'method' as const,
        computed: false,
        static: false,
      }));

      return {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'TestClass' },
        superClass: null,
        body: {
          type: 'ClassBody',
          body: methodBodies,
        },
      };
    }

    describe('Function statement counting validation', () => {
      it('should count basic statements correctly', () => {
        const functionBody = createFunctionBody([
          createVariableDeclaration('x'),
          createVariableDeclaration('y'),
          createExpressionStatement(),
          createReturnStatement(),
        ]);

        const result = countStatementsInFunction(functionBody, 'testFunction');

        expect(result.count).toBe(4);
        expect(result.details.location).toBe('testFunction');
        expect(result.details.statementTypes).toEqual({
          VariableDeclaration: 2,
          ExpressionStatement: 1,
          ReturnStatement: 1,
        });
      });

      it('should handle control flow statements', () => {
        const functionBody = createFunctionBody([
          createIfStatement(),
          createVariableDeclaration('x'),
          createReturnStatement(),
        ]);

        const result = countStatementsInFunction(functionBody, 'controlFlow');

        expect(result.count).toBe(4); // if + nested expression + variable + return
        expect(result.details.statementTypes).toEqual({
          IfStatement: 1,
          ExpressionStatement: 1,
          VariableDeclaration: 1,
          ReturnStatement: 1,
        });
      });

      it('should handle variable declarations with and without initialization', () => {
        const functionBody = createFunctionBody([
          createVariableDeclaration('x', false), // No initialization - should not count
          createVariableDeclaration('y', true), // With initialization - should count
          createVariableDeclaration('z', true), // With initialization - should count
          createReturnStatement(),
        ]);

        const result = countStatementsInFunction(functionBody, 'variableTest');

        expect(result.count).toBe(3); // 2 variable declarations with init + 1 return
        expect(result.details.statementTypes['VariableDeclaration']).toBe(2);
        expect(result.details.statementTypes['ReturnStatement']).toBe(1);
      });

      it('should handle anonymous functions', () => {
        const functionBody = createFunctionBody([
          createVariableDeclaration('x'),
          createReturnStatement(),
        ]);

        const result = countStatementsInFunction(functionBody); // No function name

        expect(result.count).toBe(2);
        expect(result.details.location).toBe('anonymous');
      });
    });

    describe('Class statement counting validation', () => {
      it('should count statements in all class methods', () => {
        const classNode = createClassNode(2); // 2 methods
        const result = countStatementsInClass(classNode, 'TestClass');

        expect(result.count).toBe(4); // 2 statements per method * 2 methods
        expect(result.details.location).toBe('TestClass');
        expect(result.details.statementTypes).toEqual({
          VariableDeclaration: 2,
          ReturnStatement: 2,
        });
      });

      it('should handle single method class', () => {
        const classNode = createClassNode(1);
        const result = countStatementsInClass(classNode, 'SingleMethodClass');

        expect(result.count).toBe(2); // 1 variable + 1 return
        expect(result.details.statementTypes).toEqual({
          VariableDeclaration: 1,
          ReturnStatement: 1,
        });
      });

      it('should handle anonymous classes', () => {
        const classNode = createClassNode(1);
        const result = countStatementsInClass(classNode); // No class name

        expect(result.count).toBe(2);
        expect(result.details.location).toBe('Class');
      });
    });

    describe('Consistency and reliability validation', () => {
      it('should produce identical results for the same input', () => {
        const functionBody = createFunctionBody([
          createVariableDeclaration('x'),
          createVariableDeclaration('y'),
          createIfStatement(),
          createReturnStatement(),
        ]);

        // Run the same test multiple times
        const result1 = countStatementsInFunction(functionBody, 'testFunction');
        const result2 = countStatementsInFunction(functionBody, 'testFunction');
        const result3 = countStatementsInFunction(functionBody, 'testFunction');

        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
        expect(result1.count).toBe(5); // 2 variables + if + nested expression + return
      });

      it('should maintain detailed statement type tracking', () => {
        const functionBody = createFunctionBody([
          createVariableDeclaration('x'),
          createExpressionStatement(),
          createIfStatement(),
          createReturnStatement(),
        ]);

        const result = countStatementsInFunction(functionBody, 'detailedTest');

        expect(result.details.statementTypes).toBeDefined();
        expect(Object.keys(result.details.statementTypes).length).toBeGreaterThan(0);

        // Verify specific statement types are tracked
        expect(result.details.statementTypes['VariableDeclaration']).toBe(1);
        expect(result.details.statementTypes['ExpressionStatement']).toBe(2); // 1 direct + 1 in if
        expect(result.details.statementTypes['IfStatement']).toBe(1);
        expect(result.details.statementTypes['ReturnStatement']).toBe(1);
      });

      it('should handle empty function bodies', () => {
        const emptyFunctionBody = createFunctionBody([]);
        const result = countStatementsInFunction(emptyFunctionBody, 'emptyFunction');

        expect(result.count).toBe(0);
        expect(result.details.location).toBe('emptyFunction');
        expect(result.details.statementTypes).toEqual({});
      });

      it('should handle classes with no methods', () => {
        const emptyClass: ESTree.ClassDeclaration = {
          type: 'ClassDeclaration',
          id: { type: 'Identifier', name: 'EmptyClass' },
          superClass: null,
          body: {
            type: 'ClassBody',
            body: [],
          },
        };

        const result = countStatementsInClass(emptyClass, 'EmptyClass');

        expect(result.count).toBe(0);
        expect(result.details.location).toBe('EmptyClass');
        expect(result.details.statementTypes).toEqual({});
      });
    });

    describe('Backwards compatibility validation', () => {
      it('should maintain the same counting behavior as before refactoring', () => {
        // This test ensures that the statement counting logic
        // produces the same results as the original implementation
        const complexFunctionBody = createFunctionBody([
          createVariableDeclaration('a'),
          createVariableDeclaration('b'),
          createIfStatement(),
          createExpressionStatement(),
          createReturnStatement(),
        ]);

        const result = countStatementsInFunction(complexFunctionBody, 'complexFunction');

        // These expected values should match the behavior of the original
        // StatementCounter implementation
        expect(result.count).toBe(6); // 2 vars + if + nested expr + direct expr + return
        expect(result.details.location).toBe('complexFunction');
        expect(typeof result.details.statementTypes).toBe('object');
        expect(result.details.statementTypes['VariableDeclaration']).toBe(2);
        expect(result.details.statementTypes['ExpressionStatement']).toBe(2);
        expect(result.details.statementTypes['IfStatement']).toBe(1);
        expect(result.details.statementTypes['ReturnStatement']).toBe(1);
      });

      it('should maintain class counting behavior consistency', () => {
        const classNode = createClassNode(3); // 3 methods
        const result = countStatementsInClass(classNode, 'MultiMethodClass');

        // These expected values should match the original behavior
        expect(result.count).toBe(6); // 2 statements per method * 3 methods
        expect(result.details.location).toBe('MultiMethodClass');
        expect(result.details.statementTypes['VariableDeclaration']).toBe(3);
        expect(result.details.statementTypes['ReturnStatement']).toBe(3);
      });
    });
  });
});
