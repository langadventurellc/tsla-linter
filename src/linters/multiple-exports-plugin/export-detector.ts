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

interface TSNode {
  type: string;
  id?: { name: string; type: string };
  typeAnnotation?: unknown;
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

    // Handle different default export types but only if the corresponding check is enabled
    if (declaration.type === 'ClassDeclaration' && checkClasses) {
      name = declaration.id?.name || 'default class';
      type = 'default';
    } else if (declaration.type === 'FunctionDeclaration' && checkFunctions) {
      name = declaration.id?.name || 'default function';
      type = 'default';
    } else if (declaration.type === 'Identifier' && checkVariables) {
      name = declaration.name;
      type = 'default';
    } else if (declaration.type === 'ArrowFunctionExpression' && checkFunctions) {
      name = 'default arrow function';
      type = 'default';
    } else if (declaration.type === 'FunctionExpression' && checkFunctions) {
      name = 'default function expression';
      type = 'default';
    }

    // If none of the checks are enabled for this export type, return null
    const shouldSkip =
      (declaration.type === 'ClassDeclaration' && !checkClasses) ||
      (declaration.type === 'FunctionDeclaration' && !checkFunctions) ||
      ((declaration.type === 'ArrowFunctionExpression' ||
        declaration.type === 'FunctionExpression') &&
        !checkFunctions) ||
      (declaration.type === 'Identifier' && !checkVariables);

    if (shouldSkip) {
      return null;
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

      // Handle TypeScript interface declarations with proper type checking
      if (checkInterfaces && isTSInterfaceDeclaration(declaration)) {
        const tsDeclaration = declaration as TSNode;
        const name = tsDeclaration.id?.name || 'anonymous';
        return { type: 'interface', name, node };
      }

      // Handle TypeScript type alias declarations with proper type checking
      if (checkTypes && isTSTypeAliasDeclaration(declaration)) {
        const tsDeclaration = declaration as TSNode;
        const name = tsDeclaration.id?.name || 'anonymous';
        return { type: 'type', name, node };
      }

      // Handle TypeScript enum declarations
      if (checkTypes && isTSEnumDeclaration(declaration)) {
        const tsDeclaration = declaration as TSNode;
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

    // Export specifiers (export { a, b }) - always check these regardless of individual type settings
    // since we can't determine the type of re-exported items without additional analysis
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

// Helper functions to properly detect TypeScript node types
function isTSInterfaceDeclaration(node: ESTree.Node): boolean {
  return 'type' in node && (node as TSNode).type === 'TSInterfaceDeclaration';
}

function isTSTypeAliasDeclaration(node: ESTree.Node): boolean {
  return 'type' in node && (node as TSNode).type === 'TSTypeAliasDeclaration';
}

function isTSEnumDeclaration(node: ESTree.Node): boolean {
  return 'type' in node && (node as TSNode).type === 'TSEnumDeclaration';
}

export interface ExportCounts {
  classes: number;
  functions: number;
  interfaces: number;
  types: number;
  variables: number;
  defaults: number;
  specifiers: number;
  total: number;
}

export function countExportsByType(exports: ExportInfo[]): ExportCounts {
  const counts: ExportCounts = {
    classes: 0,
    functions: 0,
    interfaces: 0,
    types: 0,
    variables: 0,
    defaults: 0,
    specifiers: 0,
    total: exports.length,
  };

  for (const exportInfo of exports) {
    switch (exportInfo.type) {
      case 'class':
        counts.classes++;
        break;
      case 'function':
        counts.functions++;
        break;
      case 'interface':
        counts.interfaces++;
        break;
      case 'type':
        counts.types++;
        break;
      case 'variable':
        counts.variables++;
        break;
      case 'default':
        counts.defaults++;
        break;
      case 'specifier':
        counts.specifiers++;
        break;
    }
  }

  return counts;
}

export function hasMultipleExportsOfType(exports: ExportInfo[], type: ExportInfo['type']): boolean {
  return exports.filter((exp) => exp.type === type).length > 1;
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

export function classifyExportsByCategory(exports: ExportInfo[]): {
  declarations: ExportInfo[];
  specifiers: ExportInfo[];
  defaults: ExportInfo[];
} {
  const declarations: ExportInfo[] = [];
  const specifiers: ExportInfo[] = [];
  const defaults: ExportInfo[] = [];

  for (const exportInfo of exports) {
    switch (exportInfo.type) {
      case 'class':
      case 'function':
      case 'interface':
      case 'type':
      case 'variable':
        declarations.push(exportInfo);
        break;
      case 'specifier':
        specifiers.push(exportInfo);
        break;
      case 'default':
        defaults.push(exportInfo);
        break;
    }
  }

  return { declarations, specifiers, defaults };
}

export function getDetailedExportSummary(exports: ExportInfo[]): string {
  const counts = countExportsByType(exports);
  const parts: string[] = [];

  if (counts.classes > 0) {
    parts.push(`${counts.classes} class${counts.classes > 1 ? 'es' : ''}`);
  }
  if (counts.functions > 0) {
    parts.push(`${counts.functions} function${counts.functions > 1 ? 's' : ''}`);
  }
  if (counts.interfaces > 0) {
    parts.push(`${counts.interfaces} interface${counts.interfaces > 1 ? 's' : ''}`);
  }
  if (counts.types > 0) {
    parts.push(`${counts.types} type${counts.types > 1 ? 's' : ''}`);
  }
  if (counts.variables > 0) {
    parts.push(`${counts.variables} variable${counts.variables > 1 ? 's' : ''}`);
  }
  if (counts.defaults > 0) {
    parts.push(`${counts.defaults} default export${counts.defaults > 1 ? 's' : ''}`);
  }
  if (counts.specifiers > 0) {
    parts.push(`${counts.specifiers} export specifier${counts.specifiers > 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}

export function isTypeOnlyExport(exportInfo: ExportInfo): boolean {
  return exportInfo.type === 'interface' || exportInfo.type === 'type';
}

export function isRuntimeExport(exportInfo: ExportInfo): boolean {
  return ['class', 'function', 'variable', 'default', 'specifier'].includes(exportInfo.type);
}
