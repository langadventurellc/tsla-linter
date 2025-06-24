import { Rule } from 'eslint';
import * as ESTree from 'estree';
import { ESLintPlugin } from '../../types';
import { countStatementsInClass, countStatementsInFunction } from './statement-counter';

interface SingleThresholdOptions {
  threshold?: number;
}

// Function Warning Rule
const functionStatementCountWarnRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when functions exceed the statement count threshold',
      recommended: false,
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyStatements:
        'Function "{{name}}" has {{count}} statements (recommended max {{threshold}}). Consider breaking it down into smaller functions.',
      tooManyStatementsAnonymous:
        'Anonymous function has {{count}} statements (recommended max {{threshold}}). Consider breaking it down into smaller functions.',
    },
  },
  create(context) {
    const options: SingleThresholdOptions = context.options[0] || {};

    if (options.threshold !== undefined && options.threshold < 1) {
      throw new Error('threshold must be a positive integer');
    }

    const threshold = options.threshold || 25;

    function checkFunction(node: ESTree.Function): void {
      if (!node.body || node.body.type !== 'BlockStatement') {
        return;
      }

      const functionName = getFunctionName(node);
      const result = countStatementsInFunction(node.body, functionName || undefined);
      const count = result.count;

      if (count >= threshold) {
        const messageId = functionName ? 'tooManyStatements' : 'tooManyStatementsAnonymous';
        context.report({
          node,
          messageId,
          data: {
            name: functionName || '',
            count: count.toString(),
            threshold: threshold.toString(),
          },
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
};

// Function Error Rule
const functionStatementCountErrorRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Error when functions exceed the statement count threshold',
      recommended: false,
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyStatements:
        'Function "{{name}}" has {{count}} statements (max {{threshold}}). Consider breaking it down into smaller functions.',
      tooManyStatementsAnonymous:
        'Anonymous function has {{count}} statements (max {{threshold}}). Consider breaking it down into smaller functions.',
    },
  },
  create(context) {
    const options: SingleThresholdOptions = context.options[0] || {};

    if (options.threshold !== undefined && options.threshold < 1) {
      throw new Error('threshold must be a positive integer');
    }

    const threshold = options.threshold || 50;

    function checkFunction(node: ESTree.Function): void {
      if (!node.body || node.body.type !== 'BlockStatement') {
        return;
      }

      const functionName = getFunctionName(node);
      const result = countStatementsInFunction(node.body, functionName || undefined);
      const count = result.count;

      if (count >= threshold) {
        const messageId = functionName ? 'tooManyStatements' : 'tooManyStatementsAnonymous';
        context.report({
          node,
          messageId,
          data: {
            name: functionName || '',
            count: count.toString(),
            threshold: threshold.toString(),
          },
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
};

// Class Warning Rule
const classStatementCountWarnRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when classes exceed the statement count threshold',
      recommended: false,
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyStatements:
        'Class "{{name}}" has {{count}} statements (recommended max {{threshold}}). Consider breaking it down into smaller classes or extracting methods.',
      tooManyStatementsAnonymous:
        'Anonymous class has {{count}} statements (recommended max {{threshold}}). Consider breaking it down into smaller classes or extracting methods.',
    },
  },
  create(context) {
    const options: SingleThresholdOptions = context.options[0] || {};

    if (options.threshold !== undefined && options.threshold < 1) {
      throw new Error('threshold must be a positive integer');
    }

    const threshold = options.threshold || 200;

    function checkClass(node: ESTree.ClassDeclaration | ESTree.ClassExpression): void {
      const className = getClassName(node);
      const result = countStatementsInClass(node, className || undefined);
      const count = result.count;

      if (count >= threshold) {
        const messageId = className ? 'tooManyStatements' : 'tooManyStatementsAnonymous';
        context.report({
          node,
          messageId,
          data: {
            name: className || '',
            count: count.toString(),
            threshold: threshold.toString(),
          },
        });
      }
    }

    return {
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
    };
  },
};

// Class Error Rule
const classStatementCountErrorRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Error when classes exceed the statement count threshold',
      recommended: false,
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyStatements:
        'Class "{{name}}" has {{count}} statements (max {{threshold}}). Consider breaking it down into smaller classes or extracting methods.',
      tooManyStatementsAnonymous:
        'Anonymous class has {{count}} statements (max {{threshold}}). Consider breaking it down into smaller classes or extracting methods.',
    },
  },
  create(context) {
    const options: SingleThresholdOptions = context.options[0] || {};

    if (options.threshold !== undefined && options.threshold < 1) {
      throw new Error('threshold must be a positive integer');
    }

    const threshold = options.threshold || 300;

    function checkClass(node: ESTree.ClassDeclaration | ESTree.ClassExpression): void {
      const className = getClassName(node);
      const result = countStatementsInClass(node, className || undefined);
      const count = result.count;

      if (count >= threshold) {
        const messageId = className ? 'tooManyStatements' : 'tooManyStatementsAnonymous';
        context.report({
          node,
          messageId,
          data: {
            name: className || '',
            count: count.toString(),
            threshold: threshold.toString(),
          },
        });
      }
    }

    return {
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
    };
  },
};

// Shared helper functions
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

function getClassName(node: ESTree.ClassDeclaration | ESTree.ClassExpression): string | null {
  // Class declaration
  if (node.type === 'ClassDeclaration' && node.id) {
    return node.id.name;
  }

  // Class expression assigned to variable
  if (node.type === 'ClassExpression') {
    const parent = (node as unknown as { parent?: ESTree.Node }).parent;
    if (parent) {
      if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        return parent.id.name;
      }
      if (parent.type === 'AssignmentExpression' && parent.left.type === 'Identifier') {
        return parent.left.name;
      }
      // Don't treat class expressions in object properties as named
      // They should be considered anonymous
    }
  }

  return null;
}

export const statementCountPlugin: ESLintPlugin = {
  rules: {
    'function-statement-count-warn': functionStatementCountWarnRule,
    'function-statement-count-error': functionStatementCountErrorRule,
    'class-statement-count-warn': classStatementCountWarnRule,
    'class-statement-count-error': classStatementCountErrorRule,
  },
  configs: {
    recommended: {
      rules: {
        'statement-count/function-statement-count-warn': ['warn', { threshold: 25 }],
        'statement-count/function-statement-count-error': ['error', { threshold: 50 }],
        'statement-count/class-statement-count-warn': ['warn', { threshold: 200 }],
        'statement-count/class-statement-count-error': ['error', { threshold: 300 }],
      },
    },
    strict: {
      rules: {
        'statement-count/function-statement-count-warn': ['warn', { threshold: 15 }],
        'statement-count/function-statement-count-error': ['error', { threshold: 25 }],
        'statement-count/class-statement-count-warn': ['warn', { threshold: 150 }],
        'statement-count/class-statement-count-error': ['error', { threshold: 200 }],
      },
    },
  },
};
