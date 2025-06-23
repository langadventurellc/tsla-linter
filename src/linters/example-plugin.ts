import { Rule } from 'eslint';
import { ESLintPlugin } from '../types';

const exampleRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'An example ESLint rule',
      recommended: false,
    },
    fixable: undefined,
    schema: [],
  },
  create(context) {
    return {
      Identifier(node): void {
        if (node.name === 'foo') {
          context.report({
            node,
            message: 'Avoid using "foo" as an identifier',
          });
        }
      },
    };
  },
};

export const examplePlugin: ESLintPlugin = {
  rules: {
    'no-foo': exampleRule,
  },
  configs: {
    recommended: {
      rules: {
        'example/no-foo': ['error', {}],
      },
    },
  },
};
