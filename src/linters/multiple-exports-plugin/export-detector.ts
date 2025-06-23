import * as ESTree from 'estree';

export interface ExportInfo {
  type: 'class' | 'function' | 'interface' | 'type' | 'variable' | 'default' | 'specifier';
  name: string;
  node: ESTree.Node;
}

export interface ExportDetectionResult {
  exports: ExportInfo[];
  isBarrelFile: boolean;
  hasMultipleExports: boolean;
}

export function isBarrelFile(filename: string): boolean {
  const basename = filename.split('/').pop() || '';
  return basename === 'index.ts' || basename === 'index.js';
}

export function detectExports(
  node: ESTree.ExportNamedDeclaration | ESTree.ExportDefaultDeclaration,
  _filename: string,
  options: {
    checkClasses?: boolean;
    checkFunctions?: boolean;
    checkInterfaces?: boolean;
    checkTypes?: boolean;
    checkVariables?: boolean;
  } = {},
): ExportInfo | null {
  const {
    checkClasses = true,
    checkFunctions = true,
    checkInterfaces = true,
    checkTypes = true,
    checkVariables = true,
  } = options;

  if (node.type === 'ExportDefaultDeclaration') {
    const declaration = node.declaration;
    let name = 'default';
    let type: ExportInfo['type'] = 'default';

    if (declaration.type === 'ClassDeclaration' && checkClasses) {
      name = declaration.id?.name || 'default class';
      type = 'default';
    } else if (declaration.type === 'FunctionDeclaration' && checkFunctions) {
      name = declaration.id?.name || 'default function';
      type = 'default';
    } else if (declaration.type === 'Identifier' && checkVariables) {
      name = declaration.name;
      type = 'default';
    }

    return { type, name, node };
  }

  if (node.type === 'ExportNamedDeclaration') {
    if (node.declaration) {
      const declaration = node.declaration;

      if (declaration.type === 'ClassDeclaration' && checkClasses) {
        const name = declaration.id?.name || 'anonymous';
        return { type: 'class', name, node };
      }

      if (declaration.type === 'FunctionDeclaration' && checkFunctions) {
        const name = declaration.id?.name || 'anonymous';
        return { type: 'function', name, node };
      }

      // Handle TypeScript interface declarations
      if (
        'type' in declaration &&
        (declaration as { type: string }).type === 'TSInterfaceDeclaration' &&
        checkInterfaces
      ) {
        const tsDeclaration = declaration as { id?: { name: string } };
        const name = tsDeclaration.id?.name || 'anonymous';
        return { type: 'interface', name, node };
      }

      // Handle TypeScript type alias declarations
      if (
        'type' in declaration &&
        (declaration as { type: string }).type === 'TSTypeAliasDeclaration' &&
        checkTypes
      ) {
        const tsDeclaration = declaration as { id?: { name: string } };
        const name = tsDeclaration.id?.name || 'anonymous';
        return { type: 'type', name, node };
      }

      if (declaration.type === 'VariableDeclaration' && checkVariables) {
        // Return the first variable declaration
        const firstDeclarator = declaration.declarations[0];
        if (firstDeclarator && firstDeclarator.id.type === 'Identifier') {
          return { type: 'variable', name: firstDeclarator.id.name, node };
        }
      }
    }

    // Export specifiers (export { a, b })
    if (node.specifiers && node.specifiers.length > 0) {
      const firstSpecifier = node.specifiers[0];
      if (firstSpecifier.type === 'ExportSpecifier') {
        const name =
          firstSpecifier.exported.type === 'Identifier' ? firstSpecifier.exported.name : 'unknown';
        return { type: 'specifier', name, node };
      }
    }
  }

  return null;
}

export function analyzeFileExports(
  exports: ExportInfo[],
  filename: string,
  ignoreBarrelFiles: boolean = true,
): ExportDetectionResult {
  const isBarrel = ignoreBarrelFiles && isBarrelFile(filename);
  const hasMultipleExports = exports.length > 1;

  return {
    exports,
    isBarrelFile: isBarrel,
    hasMultipleExports: hasMultipleExports && !isBarrel,
  };
}

export function getExportTypeSummary(exports: ExportInfo[]): string {
  const types = [...new Set(exports.map((e) => e.type))];
  return types.join(', ');
}
