import { Rule } from 'eslint';
import * as ESTree from 'estree';
import { ESLintPlugin } from '../types';
import { countStatementsInFunction } from '../utils/statement-counter';

interface FunctionStatementCountOptions {
  warnThreshold?: number;
  errorThreshold?: number;
}

const functionStatementCountRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum number of statements in functions',
      recommended: false,
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          warnThreshold: {
            type: 'integer',
            minimum: 1,
          },
          errorThreshold: {
            type: 'integer',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyStatements:
        'Function "{{name}}" has {{count}} statements ({{threshold}} {{level}}). Consider breaking it down into smaller functions.',
      tooManyStatementsAnonymous:
        'Anonymous function has {{count}} statements ({{threshold}} {{level}}). Consider breaking it down into smaller functions.',
    },
  },
  create(context) {
    const options: FunctionStatementCountOptions = context.options[0] || {};
    const warnThreshold = options.warnThreshold || 25;
    const errorThreshold = options.errorThreshold || 50;

    // Validate configuration
    if (warnThreshold >= errorThreshold) {
      throw new Error('warnThreshold must be less than errorThreshold');
    }

    function checkFunction(node: ESTree.Function): void {
      if (!node.body || node.body.type !== 'BlockStatement') {
        return;
      }

      const functionName = getFunctionName(node);
      const result = countStatementsInFunction(node.body, functionName || undefined);
      const count = result.count;

      let threshold: number;
      let level: 'warning' | 'error';

      if (count >= errorThreshold) {
        threshold = errorThreshold;
        level = 'error';
      } else if (count >= warnThreshold) {
        threshold = warnThreshold;
        level = 'warning';
      } else {
        return;
      }

      const messageId = functionName ? 'tooManyStatements' : 'tooManyStatementsAnonymous';

      context.report({
        node,
        messageId,
        data: {
          name: functionName || '',
          count: count.toString(),
          threshold: threshold.toString(),
          level: level === 'error' ? 'max' : 'recommended max',
        },
      });
    }

    function getFunctionName(node: ESTree.Function): string | null {
      // Function declaration
      if (node.type === 'FunctionDeclaration' && node.id) {
        return node.id.name;
      }

      // Function expression assigned to variable
      if (node.type === 'FunctionExpression') {
        const parent = (node as unknown as { parent?: ESTree.Node }).parent;
        if (parent) {
          if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
            return parent.id.name;
          }
          if (parent.type === 'AssignmentExpression' && parent.left.type === 'Identifier') {
            return parent.left.name;
          }
          if (parent.type === 'Property' && parent.key.type === 'Identifier') {
            return parent.key.name;
          }
        }
      }

      // Arrow function assigned to variable
      if (node.type === 'ArrowFunctionExpression') {
        const parent = (node as unknown as { parent?: ESTree.Node }).parent;
        if (parent) {
          if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
            return parent.id.name;
          }
          if (parent.type === 'AssignmentExpression' && parent.left.type === 'Identifier') {
            return parent.left.name;
          }
          if (parent.type === 'Property' && parent.key.type === 'Identifier') {
            return parent.key.name;
          }
        }
      }

      return null;
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
};

export const statementCountPlugin: ESLintPlugin = {
  rules: {
    'function-statement-count': functionStatementCountRule,
  },
  configs: {
    recommended: {
      rules: {
        'statement-count/function-statement-count': [
          'warn',
          { warnThreshold: 25, errorThreshold: 50 },
        ],
      },
    },
    strict: {
      rules: {
        'statement-count/function-statement-count': [
          'error',
          { warnThreshold: 15, errorThreshold: 25 },
        ],
      },
    },
  },
};
