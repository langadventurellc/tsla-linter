/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isBarrelFile,
  detectExports,
  analyzeFileExports,
  getExportTypeSummary,
  countExportsByType,
  getDetailedExportSummary,
  classifyExportsByCategory,
  hasMultipleExportsOfType,
  isTypeOnlyExport,
  isRuntimeExport,
  ExportInfo,
} from '../../linters/multiple-exports-plugin/export-detector';

describe('export-detector', () => {
  describe('isBarrelFile', () => {
    test('should identify index.ts as barrel file', () => {
      expect(isBarrelFile('/path/to/index.ts')).toBe(true);
      expect(isBarrelFile('index.ts')).toBe(true);
      expect(isBarrelFile('/deep/nested/path/to/index.ts')).toBe(true);
    });

    test('should identify index.js as barrel file', () => {
      expect(isBarrelFile('/path/to/index.js')).toBe(true);
      expect(isBarrelFile('index.js')).toBe(true);
      expect(isBarrelFile('/deep/nested/path/to/index.js')).toBe(true);
    });

    test('should not identify other files as barrel files', () => {
      expect(isBarrelFile('/path/to/component.ts')).toBe(false);
      expect(isBarrelFile('utils.js')).toBe(false);
      expect(isBarrelFile('/path/indexer.ts')).toBe(false);
      expect(isBarrelFile('/path/my-index.ts')).toBe(false);
      expect(isBarrelFile('')).toBe(false);
    });
  });

  describe('detectExports', () => {
    const filename = '/test/file.ts';

    describe('ExportDefaultDeclaration', () => {
      test('should detect default class export', () => {
        const node = {
          type: 'ExportDefaultDeclaration',
          declaration: {
            type: 'ClassDeclaration',
            id: { name: 'MyClass', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'default',
          name: 'MyClass',
          node,
        });
      });

      test('should detect default function export', () => {
        const node = {
          type: 'ExportDefaultDeclaration',
          declaration: {
            type: 'FunctionDeclaration',
            id: { name: 'myFunction', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'default',
          name: 'myFunction',
          node,
        });
      });

      test('should detect default variable export', () => {
        const node = {
          type: 'ExportDefaultDeclaration',
          declaration: {
            type: 'Identifier',
            name: 'myVariable',
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'default',
          name: 'myVariable',
          node,
        });
      });

      test('should handle anonymous default exports', () => {
        const node = {
          type: 'ExportDefaultDeclaration',
          declaration: {
            type: 'ClassDeclaration',
            id: null,
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'default',
          name: 'default class',
          node,
        });
      });
    });

    describe('ExportNamedDeclaration', () => {
      test('should detect named class export', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'ClassDeclaration',
            id: { name: 'MyClass', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'class',
          name: 'MyClass',
          node,
        });
      });

      test('should detect named function export', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'FunctionDeclaration',
            id: { name: 'myFunction', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'function',
          name: 'myFunction',
          node,
        });
      });

      test('should detect named interface export', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSInterfaceDeclaration',
            id: { name: 'MyInterface', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'interface',
          name: 'MyInterface',
          node,
        });
      });

      test('should detect named type export', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSTypeAliasDeclaration',
            id: { name: 'MyType', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'type',
          name: 'MyType',
          node,
        });
      });

      test('should detect named variable export', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: { name: 'myVariable', type: 'Identifier' },
              },
            ],
          },
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'variable',
          name: 'myVariable',
          node,
        });
      });

      test('should detect export specifier', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: null,
          specifiers: [
            {
              type: 'ExportSpecifier',
              exported: { name: 'myExport', type: 'Identifier' },
            },
          ],
        } as any;

        const result = detectExports(node, filename);
        expect(result).toEqual({
          type: 'specifier',
          name: 'myExport',
          node,
        });
      });
    });

    describe('configuration options', () => {
      test('should respect checkClasses option', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'ClassDeclaration',
            id: { name: 'MyClass', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename, { checkClasses: false });
        expect(result).toBeNull();
      });

      test('should respect checkFunctions option', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'FunctionDeclaration',
            id: { name: 'myFunction', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename, { checkFunctions: false });
        expect(result).toBeNull();
      });

      test('should respect checkInterfaces option', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSInterfaceDeclaration',
            id: { name: 'MyInterface', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename, { checkInterfaces: false });
        expect(result).toBeNull();
      });

      test('should respect checkTypes option', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSTypeAliasDeclaration',
            id: { name: 'MyType', type: 'Identifier' },
          },
        } as any;

        const result = detectExports(node, filename, { checkTypes: false });
        expect(result).toBeNull();
      });

      test('should respect checkVariables option', () => {
        const node = {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                id: { name: 'myVariable', type: 'Identifier' },
              },
            ],
          },
        } as any;

        const result = detectExports(node, filename, { checkVariables: false });
        expect(result).toBeNull();
      });
    });
  });

  describe('analyzeFileExports', () => {
    const mockExports: ExportInfo[] = [
      { type: 'function', name: 'func1', node: {} as any },
      { type: 'class', name: 'Class1', node: {} as any },
    ];

    test('should identify multiple exports in regular file', () => {
      const result = analyzeFileExports(mockExports, '/path/to/file.ts');
      expect(result).toEqual({
        exports: mockExports,
        isBarrelFile: false,
        hasMultipleExports: true,
      });
    });

    test('should ignore multiple exports in barrel file', () => {
      const result = analyzeFileExports(mockExports, '/path/to/index.ts');
      expect(result).toEqual({
        exports: mockExports,
        isBarrelFile: true,
        hasMultipleExports: false,
      });
    });

    test('should handle single export', () => {
      const singleExport = [mockExports[0]];
      const result = analyzeFileExports(singleExport, '/path/to/file.ts');
      expect(result).toEqual({
        exports: singleExport,
        isBarrelFile: false,
        hasMultipleExports: false,
      });
    });

    test('should handle empty exports', () => {
      const result = analyzeFileExports([], '/path/to/file.ts');
      expect(result).toEqual({
        exports: [],
        isBarrelFile: false,
        hasMultipleExports: false,
      });
    });

    test('should respect ignoreBarrelFiles option', () => {
      const result = analyzeFileExports(mockExports, '/path/to/index.ts', false);
      expect(result).toEqual({
        exports: mockExports,
        isBarrelFile: false,
        hasMultipleExports: true,
      });
    });
  });

  describe('getExportTypeSummary', () => {
    test('should generate summary for single export type', () => {
      const exports: ExportInfo[] = [
        { type: 'function', name: 'func1', node: {} as any },
        { type: 'function', name: 'func2', node: {} as any },
      ];

      const result = getExportTypeSummary(exports);
      expect(result).toBe('function');
    });

    test('should generate summary for multiple export types', () => {
      const exports: ExportInfo[] = [
        { type: 'function', name: 'func1', node: {} as any },
        { type: 'class', name: 'Class1', node: {} as any },
        { type: 'interface', name: 'Interface1', node: {} as any },
      ];

      const result = getExportTypeSummary(exports);
      expect(result).toBe('function, class, interface');
    });

    test('should handle duplicate types', () => {
      const exports: ExportInfo[] = [
        { type: 'function', name: 'func1', node: {} as any },
        { type: 'class', name: 'Class1', node: {} as any },
        { type: 'function', name: 'func2', node: {} as any },
        { type: 'class', name: 'Class2', node: {} as any },
      ];

      const result = getExportTypeSummary(exports);
      expect(result).toBe('function, class');
    });

    test('should handle empty exports', () => {
      const result = getExportTypeSummary([]);
      expect(result).toBe('');
    });
  });

  describe('countExportsByType', () => {
    test('should count exports by type correctly', () => {
      const exports: ExportInfo[] = [
        { type: 'function', name: 'func1', node: {} as any },
        { type: 'function', name: 'func2', node: {} as any },
        { type: 'class', name: 'Class1', node: {} as any },
        { type: 'interface', name: 'Interface1', node: {} as any },
        { type: 'type', name: 'Type1', node: {} as any },
        { type: 'variable', name: 'var1', node: {} as any },
        { type: 'default', name: 'default', node: {} as any },
        { type: 'specifier', name: 'spec1', node: {} as any },
      ];

      const counts = countExportsByType(exports);
      expect(counts).toEqual({
        classes: 1,
        functions: 2,
        interfaces: 1,
        types: 1,
        variables: 1,
        defaults: 1,
        specifiers: 1,
        total: 8,
      });
    });

    test('should handle empty exports array', () => {
      const counts = countExportsByType([]);
      expect(counts).toEqual({
        classes: 0,
        functions: 0,
        interfaces: 0,
        types: 0,
        variables: 0,
        defaults: 0,
        specifiers: 0,
        total: 0,
      });
    });
  });

  describe('hasMultipleExportsOfType', () => {
    const exports: ExportInfo[] = [
      { type: 'function', name: 'func1', node: {} as any },
      { type: 'function', name: 'func2', node: {} as any },
      { type: 'class', name: 'Class1', node: {} as any },
    ];

    test('should return true for multiple exports of same type', () => {
      expect(hasMultipleExportsOfType(exports, 'function')).toBe(true);
    });

    test('should return false for single export of type', () => {
      expect(hasMultipleExportsOfType(exports, 'class')).toBe(false);
    });

    test('should return false for non-existent type', () => {
      expect(hasMultipleExportsOfType(exports, 'interface')).toBe(false);
    });
  });

  describe('getDetailedExportSummary', () => {
    test('should generate detailed summary for mixed exports', () => {
      const exports: ExportInfo[] = [
        { type: 'function', name: 'func1', node: {} as any },
        { type: 'function', name: 'func2', node: {} as any },
        { type: 'class', name: 'Class1', node: {} as any },
        { type: 'interface', name: 'Interface1', node: {} as any },
        { type: 'type', name: 'Type1', node: {} as any },
        { type: 'variable', name: 'var1', node: {} as any },
        { type: 'default', name: 'default', node: {} as any },
        { type: 'specifier', name: 'spec1', node: {} as any },
        { type: 'specifier', name: 'spec2', node: {} as any },
      ];

      const result = getDetailedExportSummary(exports);
      expect(result).toBe(
        '1 class, 2 functions, 1 interface, 1 type, 1 variable, 1 default export, 2 export specifiers',
      );
    });

    test('should handle single export correctly', () => {
      const exports: ExportInfo[] = [{ type: 'function', name: 'func1', node: {} as any }];

      const result = getDetailedExportSummary(exports);
      expect(result).toBe('1 function');
    });

    test('should handle empty exports', () => {
      const result = getDetailedExportSummary([]);
      expect(result).toBe('');
    });
  });

  describe('classifyExportsByCategory', () => {
    test('should classify exports by category', () => {
      const exports: ExportInfo[] = [
        { type: 'function', name: 'func1', node: {} as any },
        { type: 'class', name: 'Class1', node: {} as any },
        { type: 'interface', name: 'Interface1', node: {} as any },
        { type: 'type', name: 'Type1', node: {} as any },
        { type: 'variable', name: 'var1', node: {} as any },
        { type: 'default', name: 'default', node: {} as any },
        { type: 'specifier', name: 'spec1', node: {} as any },
      ];

      const result = classifyExportsByCategory(exports);
      expect(result.declarations).toHaveLength(5); // function, class, interface, type, variable
      expect(result.specifiers).toHaveLength(1);
      expect(result.defaults).toHaveLength(1);
    });

    test('should handle empty exports', () => {
      const result = classifyExportsByCategory([]);
      expect(result.declarations).toHaveLength(0);
      expect(result.specifiers).toHaveLength(0);
      expect(result.defaults).toHaveLength(0);
    });
  });

  describe('isTypeOnlyExport', () => {
    test('should identify type-only exports', () => {
      expect(isTypeOnlyExport({ type: 'interface', name: 'Interface1', node: {} as any })).toBe(
        true,
      );
      expect(isTypeOnlyExport({ type: 'type', name: 'Type1', node: {} as any })).toBe(true);
    });

    test('should identify runtime exports', () => {
      expect(isTypeOnlyExport({ type: 'class', name: 'Class1', node: {} as any })).toBe(false);
      expect(isTypeOnlyExport({ type: 'function', name: 'func1', node: {} as any })).toBe(false);
      expect(isTypeOnlyExport({ type: 'variable', name: 'var1', node: {} as any })).toBe(false);
      expect(isTypeOnlyExport({ type: 'default', name: 'default', node: {} as any })).toBe(false);
      expect(isTypeOnlyExport({ type: 'specifier', name: 'spec1', node: {} as any })).toBe(false);
    });
  });

  describe('isRuntimeExport', () => {
    test('should identify runtime exports', () => {
      expect(isRuntimeExport({ type: 'class', name: 'Class1', node: {} as any })).toBe(true);
      expect(isRuntimeExport({ type: 'function', name: 'func1', node: {} as any })).toBe(true);
      expect(isRuntimeExport({ type: 'variable', name: 'var1', node: {} as any })).toBe(true);
      expect(isRuntimeExport({ type: 'default', name: 'default', node: {} as any })).toBe(true);
      expect(isRuntimeExport({ type: 'specifier', name: 'spec1', node: {} as any })).toBe(true);
    });

    test('should identify type-only exports', () => {
      expect(isRuntimeExport({ type: 'interface', name: 'Interface1', node: {} as any })).toBe(
        false,
      );
      expect(isRuntimeExport({ type: 'type', name: 'Type1', node: {} as any })).toBe(false);
    });
  });

  describe('detectExports - enhanced TypeScript support', () => {
    const filename = '/test/file.ts';

    test('should detect TypeScript enum export', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        declaration: {
          type: 'TSEnumDeclaration',
          id: { name: 'MyEnum', type: 'Identifier' },
        },
      } as any;

      const result = detectExports(node, filename);
      expect(result).toEqual({
        type: 'type',
        name: 'MyEnum',
        node,
      });
    });

    test('should handle arrow function default exports', () => {
      const node = {
        type: 'ExportDefaultDeclaration',
        declaration: {
          type: 'ArrowFunctionExpression',
        },
      } as any;

      const result = detectExports(node, filename);
      expect(result).toEqual({
        type: 'default',
        name: 'default arrow function',
        node,
      });
    });

    test('should handle function expression default exports', () => {
      const node = {
        type: 'ExportDefaultDeclaration',
        declaration: {
          type: 'FunctionExpression',
        },
      } as any;

      const result = detectExports(node, filename);
      expect(result).toEqual({
        type: 'default',
        name: 'default function expression',
        node,
      });
    });

    test('should respect configuration for default exports', () => {
      const node = {
        type: 'ExportDefaultDeclaration',
        declaration: {
          type: 'ClassDeclaration',
          id: { name: 'MyClass', type: 'Identifier' },
        },
      } as any;

      const result = detectExports(node, filename, { checkClasses: false });
      expect(result).toBeNull();
    });

    test('should respect configuration for arrow functions', () => {
      const node = {
        type: 'ExportDefaultDeclaration',
        declaration: {
          type: 'ArrowFunctionExpression',
        },
      } as any;

      const result = detectExports(node, filename, { checkFunctions: false });
      expect(result).toBeNull();
    });
  });
});
