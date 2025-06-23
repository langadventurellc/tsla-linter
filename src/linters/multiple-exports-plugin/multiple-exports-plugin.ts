import { Rule } from 'eslint';
import * as ESTree from 'estree';
import { ESLintPlugin } from '../../types';
import {
  ExportInfo,
  detectExports,
  analyzeFileExports,
  getExportTypeSummary,
} from './export-detector';

interface MultipleExportsOptions {
  checkClasses?: boolean;
  checkFunctions?: boolean;
  checkInterfaces?: boolean;
  checkTypes?: boolean;
  checkVariables?: boolean;
  ignoreBarrelFiles?: boolean;
}

const multipleExportsRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a single export per file (excluding barrel files)',
      recommended: false,
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          checkClasses: {
            type: 'boolean',
            default: true,
          },
          checkFunctions: {
            type: 'boolean',
            default: true,
          },
          checkInterfaces: {
            type: 'boolean',
            default: true,
          },
          checkTypes: {
            type: 'boolean',
            default: true,
          },
          checkVariables: {
            type: 'boolean',
            default: true,
          },
          ignoreBarrelFiles: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      multipleExports:
        'Multiple exports found in file. Consider splitting into separate files or using a barrel file pattern.',
      multipleExportsDetailed:
        'Multiple exports found: {{exportTypes}}. Consider splitting into separate files.',
    },
  },
  create(context) {
    const options: MultipleExportsOptions = context.options[0] || {};
    const {
      checkClasses = true,
      checkFunctions = true,
      checkInterfaces = true,
      checkTypes = true,
      checkVariables = true,
      ignoreBarrelFiles = true,
    } = options;

    const exports: ExportInfo[] = [];
    const filename = context.getFilename();

    function checkForViolations(): void {
      const analysis = analyzeFileExports(exports, filename, ignoreBarrelFiles);

      if (!analysis.hasMultipleExports) {
        return;
      }

      const exportTypes = getExportTypeSummary(analysis.exports);
      const firstExport = analysis.exports[0];

      context.report({
        node: firstExport.node,
        messageId: 'multipleExportsDetailed',
        data: {
          exportTypes,
        },
      });
    }

    return {
      ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration): void {
        const exportInfo = detectExports(node, filename, {
          checkClasses,
          checkFunctions,
          checkInterfaces,
          checkTypes,
          checkVariables,
        });

        if (exportInfo) {
          exports.push(exportInfo);
        }

        // Handle multiple export specifiers
        if (node.specifiers && node.specifiers.length > 1) {
          node.specifiers.slice(1).forEach((specifier) => {
            if (specifier.type === 'ExportSpecifier') {
              const name =
                specifier.exported.type === 'Identifier' ? specifier.exported.name : 'unknown';
              exports.push({ type: 'specifier', name, node });
            }
          });
        }
      },

      ExportDefaultDeclaration(node: ESTree.ExportDefaultDeclaration): void {
        const exportInfo = detectExports(node, filename, {
          checkClasses,
          checkFunctions,
          checkInterfaces,
          checkTypes,
          checkVariables,
        });

        if (exportInfo) {
          exports.push(exportInfo);
        }
      },

      'Program:exit'(): void {
        checkForViolations();
      },
    };
  },
};

export const multipleExportsPlugin: ESLintPlugin = {
  rules: {
    'no-multiple-exports': multipleExportsRule,
  },
  configs: {
    recommended: {
      rules: {
        'multiple-exports/no-multiple-exports': [
          'warn',
          {
            checkClasses: true,
            checkFunctions: true,
            checkInterfaces: true,
            checkTypes: true,
            checkVariables: true,
            ignoreBarrelFiles: true,
          },
        ],
      },
    },
    strict: {
      rules: {
        'multiple-exports/no-multiple-exports': [
          'error',
          {
            checkClasses: true,
            checkFunctions: true,
            checkInterfaces: true,
            checkTypes: true,
            checkVariables: true,
            ignoreBarrelFiles: true,
          },
        ],
      },
    },
  },
};
