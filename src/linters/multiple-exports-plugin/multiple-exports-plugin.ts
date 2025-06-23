import { Rule } from 'eslint';
import * as ESTree from 'estree';
import { ESLintPlugin } from '../../types';
import {
  ExportInfo,
  detectExports,
  analyzeFileExports,
  getExportTypeSummary,
  getDetailedExportSummary,
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
        'Multiple exports found: {{exportTypes}}. Consider splitting into separate files, each exporting a single item, or create a barrel file (index.ts) if these are related exports.',
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

      // Filter exports based on configuration options
      const relevantExports = exports.filter((exportInfo) => {
        switch (exportInfo.type) {
          case 'class':
            return checkClasses;
          case 'function':
            return checkFunctions;
          case 'interface':
            return checkInterfaces;
          case 'type':
            return checkTypes;
          case 'variable':
            return checkVariables;
          case 'default':
            // Check defaults based on what they export
            return true; // Always check defaults for now
          case 'specifier':
            // Always check specifiers since we can't determine their original type
            return true;
          default:
            return true;
        }
      });

      // Only report if we have multiple relevant exports
      if (relevantExports.length <= 1) {
        return;
      }

      const detailedSummary = getDetailedExportSummary(relevantExports);
      const exportTypes = getExportTypeSummary(relevantExports);
      const firstExport = relevantExports[0];

      context.report({
        node: firstExport.node,
        messageId: 'multipleExportsDetailed',
        data: {
          exportTypes: detailedSummary || exportTypes,
        },
      });
    }

    return {
      ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration): void {
        // Handle declaration exports (e.g., export class Foo {})
        if (node.declaration) {
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
        }

        // Handle export specifiers (e.g., export { a, b })
        if (node.specifiers && node.specifiers.length > 0) {
          node.specifiers.forEach((specifier) => {
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
