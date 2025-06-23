import * as ESTree from 'estree';

export interface StatementCountResult {
  count: number;
  details: {
    location: string;
    statementTypes: Record<string, number>;
  };
}

export class StatementCounter {
  private count = 0;
  private statementTypes: Record<string, number> = {};
  private functionName = '';

  countStatements(node: ESTree.Node, functionName?: string): StatementCountResult {
    this.count = 0;
    this.statementTypes = {};
    this.functionName = functionName || 'anonymous';

    this.traverse(node);

    return {
      count: this.count,
      details: {
        location: this.functionName,
        statementTypes: { ...this.statementTypes },
      },
    };
  }

  private traverse(node: ESTree.Node): void {
    if (!node) return;

    if (this.isExecutableStatement(node)) {
      this.count++;
      this.trackStatementType(node.type);
    }

    if (this.shouldTraverseChildren(node)) {
      this.traverseChildren(node);
    }
  }

  private isExecutableStatement(node: ESTree.Node): boolean {
    const executableTypes = new Set([
      'ExpressionStatement',
      'ReturnStatement',
      'BreakStatement',
      'ContinueStatement',
      'ThrowStatement',
      'IfStatement',
      'ForStatement',
      'ForInStatement',
      'ForOfStatement',
      'WhileStatement',
      'DoWhileStatement',
      'SwitchStatement',
      'TryStatement',
      'WithStatement',
      'LabeledStatement',
      'EmptyStatement',
      'DebuggerStatement',
    ]);

    if (executableTypes.has(node.type)) {
      return true;
    }

    // Count variable declarations only if they have initializations
    if (node.type === 'VariableDeclaration') {
      const varDecl = node as unknown as { declarations: Array<{ init: unknown }> };
      return varDecl.declarations && varDecl.declarations.some((decl) => decl.init !== null);
    }

    return false;
  }

  private shouldTraverseChildren(node: ESTree.Node): boolean {
    const skipTypes = new Set([
      'FunctionDeclaration',
      'FunctionExpression',
      'ArrowFunctionExpression',
      'ClassDeclaration',
      'ClassExpression',
    ]);

    return !skipTypes.has(node.type);
  }

  private traverseChildren(node: ESTree.Node): void {
    const nodeAsAny = node as unknown as Record<string, unknown>;

    for (const key in nodeAsAny) {
      if (key === 'parent' || key === 'type' || key === 'range' || key === 'loc') {
        continue;
      }

      const child = nodeAsAny[key];

      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && item.type) {
              this.traverse(item);
            }
          }
        } else if ((child as ESTree.Node).type) {
          this.traverse(child as ESTree.Node);
        }
      }
    }
  }

  private trackStatementType(type: string): void {
    this.statementTypes[type] = (this.statementTypes[type] || 0) + 1;
  }
}

export function countStatementsInFunction(
  node: ESTree.Node,
  functionName?: string,
): StatementCountResult {
  const counter = new StatementCounter();
  return counter.countStatements(node, functionName);
}

export function countStatementsInClass(
  node: ESTree.Node,
  className?: string,
): StatementCountResult {
  const counter = new StatementCounter();
  const nodeAsAny = node as unknown as { body?: { body?: Record<string, unknown>[] } };
  let totalCount = 0;
  const allStatementTypes: Record<string, number> = {};

  if (nodeAsAny.body && nodeAsAny.body.body) {
    for (const member of nodeAsAny.body.body) {
      const memberAny = member as unknown as {
        type: string;
        value?: { body: ESTree.Node };
        key?: { name?: string };
      };
      if (memberAny.type === 'MethodDefinition' && memberAny.value) {
        const result = counter.countStatements(
          memberAny.value.body,
          `${className || 'Class'}.${memberAny.key?.name || 'method'}`,
        );
        totalCount += result.count;

        for (const [type, count] of Object.entries(result.details.statementTypes)) {
          allStatementTypes[type] = (allStatementTypes[type] || 0) + count;
        }
      }
    }
  }

  return {
    count: totalCount,
    details: {
      location: className || 'Class',
      statementTypes: allStatementTypes,
    },
  };
}
