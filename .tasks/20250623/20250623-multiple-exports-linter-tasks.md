# Feature Implementation Plan: Multiple Exports Linter

_Generated: 2025-06-23_
_Based on Feature Specification: .tasks/20250623/20250623-multiple-exports-linter-feature.md_

## Architecture Overview

The multiple exports linter will be implemented as an ESLint plugin that uses AST (Abstract Syntax Tree) traversal to detect multiple export declarations within a single file. The plugin follows the established pattern used by existing plugins in the codebase, specifically the statement-count-plugin architecture.

### System Architecture

```mermaid
graph TD
    A[ESLint Engine] --> B[Multiple Exports Plugin]
    B --> C[Export Detection Rule]
    C --> D[AST Visitor Pattern]
    D --> E[Export Declaration Nodes]
    E --> F{Is Barrel File?}
    F -->|Yes| G[Skip Linting]
    F -->|No| H[Count Exports by Type]
    H --> I{Multiple Exports?}
    I -->|Yes| J[Report Violation]
    I -->|No| K[Continue Processing]
    J --> L[Error Message with Suggestions]

    M[Configuration Schema] --> C
    N[Rule Options] --> C
```

### Data Flow

```mermaid
sequenceDiagram
    participant E as ESLint Engine
    participant P as Plugin
    participant R as Rule
    participant A as AST Visitor
    participant C as Export Counter

    E->>P: Load plugin with configuration
    P->>R: Initialize rule with options
    E->>R: Process file AST
    R->>A: Visit export declarations
    A->>C: Count export by type
    C->>R: Return export counts
    R->>R: Check if barrel file
    R->>R: Evaluate violation conditions
    R->>E: Report violations (if any)
```

## Technology Stack

### Core Technologies

- **Language/Runtime:** TypeScript 5.x with strict mode
- **Framework:** ESLint Rule API v9.x
- **Testing:** Jest 30.x with ts-jest preset
- **Build System:** TypeScript compiler (tsc)

### Libraries & Dependencies

- **ESLint Integration:** @types/eslint, ESTree AST types
- **Testing:** @types/jest, RuleTester from ESLint
- **Development:** Prettier, Husky for pre-commit hooks
- **Type Safety:** @typescript-eslint/parser and plugin

### Patterns & Approaches

- **Architectural Patterns:** ESLint Rule Module pattern, AST Visitor pattern
- **Design Patterns:** Strategy pattern for export type checking
- **Development Practices:** Test-driven development, Configuration schema validation

### External Integrations

- **ESLint API:** Rule.RuleModule interface, RuleTester for testing
- **AST Processing:** ESTree node types for JavaScript/TypeScript parsing
- **Build Pipeline:** Integration with existing npm scripts (lint, test, build)

## Relevant Files

- `src/linters/multiple-exports-plugin/multiple-exports-plugin.ts` - Main plugin implementation
- `src/linters/multiple-exports-plugin/export-detector.ts` - Export detection logic
- `src/__tests__/multiple-exports-plugin/multiple-exports-plugin.test.ts` - Plugin tests
- `src/__tests__/multiple-exports-plugin/export-detector.test.ts` - Export detector tests
- `src/index.ts` - Plugin export registration
- `src/types.ts` - Type definitions (existing)

## Implementation Notes

- Tests should be placed in `src/__tests__/multiple-exports-plugin/` following the existing convention
- Use `npm test` to run the Jest test suite
- Follow the existing file naming and directory structure conventions
- After completing each subtask, mark it as complete and run `npm run lint && npm run format && npm test && npm run build`
- After completing a parent task, stop and wait for user confirmation before proceeding
- Use the ESLint RuleTester for comprehensive rule testing scenarios

## Implementation Tasks

- [x] 1.0 **Core Plugin Structure Setup**
  - [x] 1.1 Create plugin directory structure (`src/linters/multiple-exports-plugin/`)
  - [x] 1.2 Implement basic plugin scaffolding with ESLintPlugin interface
  - [x] 1.3 Define configuration schema for export type checking options
  - [x] 1.4 Set up barrel file detection utility function
  - [x] 1.5 Create initial test file structure and basic test setup

  ### Files modified with description of changes
  - `src/linters/multiple-exports-plugin/multiple-exports-plugin.ts` - Main plugin implementation with ESLint rule structure, configuration schema, and rule logic for detecting multiple exports
  - `src/linters/multiple-exports-plugin/export-detector.ts` - Utility functions for detecting exports, analyzing barrel files, and categorizing export types
  - `src/__tests__/multiple-exports-plugin/multiple-exports-plugin.test.ts` - Comprehensive test suite for the main plugin with various scenarios including barrel file exemption and configuration options
  - `src/__tests__/multiple-exports-plugin/export-detector.test.ts` - Unit tests for the export detector utility functions covering all export types and edge cases

- [x] 2.0 **Export Detection Logic Implementation**
  - [x] 2.1 Implement AST visitor for ExportNamedDeclaration and ExportDefaultDeclaration nodes
  - [x] 2.2 Create export counting logic for classes, functions, and interfaces
  - [x] 2.3 Add export type classification (class/function/interface identification)
  - [x] 2.4 Implement configuration-based filtering of export types to check
  - [x] 2.5 Write comprehensive tests for export detection scenarios

  ### Files modified with description of changes
  - `src/linters/multiple-exports-plugin/export-detector.ts` - Enhanced TypeScript support with proper AST node detection for interfaces, types, and enums; added export counting utilities (`countExportsByType`, `hasMultipleExportsOfType`); improved export classification with functions for categorizing by runtime vs type-only exports; added detailed export summary generation
  - `src/linters/multiple-exports-plugin/multiple-exports-plugin.ts` - Improved AST visitor logic to handle export specifiers more efficiently; enhanced configuration-based filtering in violation detection; integrated detailed export summary reporting for better error messages
  - `src/__tests__/multiple-exports-plugin/export-detector.test.ts` - Added comprehensive tests for all new utility functions including export counting, classification, and TypeScript support; enhanced coverage for configuration options and edge cases
  - `src/__tests__/multiple-exports-plugin/multiple-exports-plugin.test.ts` - Updated existing tests to match enhanced error message format; added new test scenarios for TypeScript constructs and configuration filtering; improved test coverage for barrel file exemption and mixed export scenarios

- [x] 3.0 **Rule Logic and Violation Detection**
  - [x] 3.1 Implement main rule logic with context.report() for violations
  - [x] 3.2 Create clear error messages with export details and suggestions
  - [x] 3.3 Add support for both warning and error severity levels
  - [x] 3.4 Implement rule configuration validation and error handling
  - [x] 3.5 Write tests for rule logic, error messages, and configuration scenarios

  ### Files modified with description of changes
  - `src/linters/multiple-exports-plugin/multiple-exports-plugin.ts` - Enhanced error messages to provide more specific and actionable suggestions for developers when multiple exports are detected, including guidance on splitting files or creating barrel files

- [x] 4.0 **Integration and Configuration**
  - [x] 4.1 Add plugin export to main index.ts file
  - [x] 4.2 Create recommended and strict configuration presets
  - [x] 4.3 Implement plugin metadata (description, docs, schema)
  - [x] 4.4 Add integration tests with various TypeScript/JavaScript file scenarios
  - [x] 4.5 Test plugin integration with existing ESLint configurations

  ### Files modified with description of changes
  - `src/index.ts` - Added export for multipleExportsPlugin to make it available as a public API
  - `src/linters/multiple-exports-plugin/multiple-exports-plugin.ts` - Enhanced plugin metadata with better descriptions, documentation URL, category classification, and detailed schema descriptions for all configuration options
  - `src/__tests__/multiple-exports-plugin/integration.test.ts` - Created comprehensive integration test suite covering real-world TypeScript/JavaScript scenarios, complex export patterns, configuration preset testing, and file type variations

- [x] 5.0 **Comprehensive Testing and Edge Cases**
  - [x] 5.1 Test barrel file exemption scenarios (index.ts, index.js variations)
  - [x] 5.2 Test mixed export scenarios (default + named, various combinations)
  - [x] 5.3 Test configuration options (enabling/disabling specific export types)
  - [x] 5.4 Test edge cases (re-exports, namespace exports, type-only exports)
  - [x] 5.5 Performance testing with large files and complex export scenarios

  ### Files modified with description of changes
  - `src/__tests__/multiple-exports-plugin/barrel-file-exemption.test.ts` - Comprehensive test suite for barrel file detection covering standard patterns (index.ts/index.js), nested paths, configuration impacts, and complex barrel file scenarios with mixed export types
  - `src/__tests__/multiple-exports-plugin/mixed-export-scenarios.test.ts` - Extensive test coverage for mixed export combinations including default + named exports, TypeScript runtime + type exports, complex export specifiers, re-export patterns, and modern JavaScript features (async/generators)
  - `src/__tests__/multiple-exports-plugin/configuration-options.test.ts` - Detailed testing of all configuration options (checkClasses, checkFunctions, checkInterfaces, checkTypes, checkVariables, ignoreBarrelFiles) with selective enabling/disabling and combination scenarios
  - `src/__tests__/multiple-exports-plugin/edge-cases.test.ts` - Advanced edge case testing including re-export patterns, namespace exports, type-only exports, complex TypeScript constructs (generics, utility types, template literals), and unusual syntax patterns

- [x] 6.0 **Quality Assurance and Documentation**
  - [x] 6.1 Run full quality pipeline (lint, format, test, build) and fix any issues
  - [x] 6.2 Verify rule works correctly with existing codebase files
  - [x] 6.3 Test plugin installation and configuration scenarios
  - [x] 6.4 Update documentation with usage examples and configuration options
  - [x] 6.5 Final integration testing with all quality tools passing

  ### Files modified with description of changes
  - `README.md` - Added comprehensive documentation for the Multiple Exports Plugin including usage examples, configuration options, barrel file detection, and preset configurations. Enhanced existing documentation to include both Statement Count and Multiple Exports plugins with clear examples for different use cases.
