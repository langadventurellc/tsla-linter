# @langadventurellc/tsla-linter

A collection of custom ESLint plugins for enforcing code quality standards.

## Installation

This package is published to GitHub Packages. To install:

1. Create a `.npmrc` file in your project root:

```
@langadventurellc:registry=https://npm.pkg.github.com
```

2. Install the package:

```bash
npm install @langadventurellc/tsla-linter --save-dev
```

## Usage

This package provides ESLint plugins for enforcing code quality standards:

- **Statement Count Plugin**: Limits the number of executable statements in functions and classes to maintain code readability
- **Multiple Exports Plugin**: Enforces a single export per file to improve code organization and maintainability

### Basic Usage

```javascript
// eslint.config.js
const { statementCountPlugin, multipleExportsPlugin } = require('@langadventurellc/tsla-linter');

module.exports = [
  {
    plugins: {
      'statement-count': statementCountPlugin,
      'multiple-exports': multipleExportsPlugin,
    },
    rules: {
      'statement-count/function-statement-count': 'warn',
      'statement-count/class-statement-count': 'warn',
      'multiple-exports/no-multiple-exports': 'error',
    },
  },
];
```

### Configuration Options

#### Statement Count Plugin

The Statement Count rules support configurable thresholds:

```javascript
// Custom thresholds
{
  rules: {
    'statement-count/function-statement-count': ['error', {
      warnThreshold: 20,    // Warning threshold (default: 25)
      errorThreshold: 40    // Error threshold (default: 50)
    }],
    'statement-count/class-statement-count': ['error', {
      warnThreshold: 150,   // Warning threshold (default: 200)
      errorThreshold: 250   // Error threshold (default: 300)
    }]
  }
}
```

#### Multiple Exports Plugin

The Multiple Exports rule can be configured to check specific export types:

```javascript
// Default configuration (all checks enabled)
{
  rules: {
    'multiple-exports/no-multiple-exports': 'error'
  }
}

// Custom configuration
{
  rules: {
    'multiple-exports/no-multiple-exports': ['error', {
      checkClasses: true,      // Check for multiple class exports (default: true)
      checkFunctions: true,    // Check for multiple function exports (default: true)
      checkInterfaces: true,   // Check for multiple interface exports (default: true)
      checkTypes: true,        // Check for multiple type exports (default: true)
      checkVariables: true,    // Check for multiple variable exports (default: true)
      ignoreBarrelFiles: true  // Ignore barrel files like index.ts (default: true)
    }]
  }
}

// Only check classes and functions
{
  rules: {
    'multiple-exports/no-multiple-exports': ['error', {
      checkClasses: true,
      checkFunctions: true,
      checkInterfaces: false,
      checkTypes: false,
      checkVariables: false
    }]
  }
}
```

### Preset Configurations

The plugin includes preset configurations for common use cases:

```javascript
// Use recommended settings for Statement Count Plugin
{
  plugins: {
    'statement-count': statementCountPlugin
  },
  ...statementCountPlugin.configs.recommended
}

// Use strict settings for higher code quality
{
  plugins: {
    'statement-count': statementCountPlugin
  },
  ...statementCountPlugin.configs.strict
}

// Use recommended settings for Multiple Exports Plugin
{
  plugins: {
    'multiple-exports': multipleExportsPlugin
  },
  ...multipleExportsPlugin.configs.recommended
}

// Use strict settings (no barrel file exemption)
{
  plugins: {
    'multiple-exports': multipleExportsPlugin
  },
  ...multipleExportsPlugin.configs.strict
}
```

### TypeScript Support

For TypeScript projects, configure your ESLint to use the TypeScript parser:

```javascript
module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      'statement-count': statementCountPlugin,
      'multiple-exports': multipleExportsPlugin,
    },
    rules: {
      'statement-count/function-statement-count': 'warn',
      'statement-count/class-statement-count': 'warn',
      'multiple-exports/no-multiple-exports': 'error',
    },
  },
];
```

## Available Rules

### Statement Count Plugin (`statementCountPlugin`)

- **`statement-count/function-statement-count`**: Limits the number of executable statements in functions
  - **Default**: Warning at 25 statements, error at 50 statements
  - **Rationale**: Large functions are harder to understand, test, and maintain
  - **Applies to**: Function declarations, function expressions, arrow functions
- **`statement-count/class-statement-count`**: Limits the number of executable statements in classes
  - **Default**: Warning at 200 statements, error at 300 statements
  - **Rationale**: Large classes violate single responsibility principle
  - **Applies to**: Class declarations and class expressions

### What Counts as a Statement?

The plugin counts these as executable statements:

- Expression statements (`console.log()`, `doSomething()`)
- Return statements
- Control flow statements (`if`, `for`, `while`, `switch`, etc.)
- Try/catch blocks
- Throw statements
- Variable declarations with initializers (`const x = 1`)

The plugin excludes:

- Function and class declarations (counted separately)
- Interface and type declarations
- Import/export statements
- Bare variable declarations without initializers (`let x;`)

### Configuration Presets

- **Recommended**: Balanced settings for most projects
  - Functions: warn at 25, error at 50
  - Classes: warn at 200, error at 300

- **Strict**: Higher standards for critical codebases
  - Functions: warn at 15, error at 25
  - Classes: warn at 150, error at 200

### Multiple Exports Plugin (`multipleExportsPlugin`)

- **`multiple-exports/no-multiple-exports`**: Enforces a single export per file to improve code organization and maintainability
  - **Default**: Error on any file with multiple exports (excluding barrel files)
  - **Rationale**: Files with multiple exports are harder to understand and refactor
  - **Applies to**: All export declarations (classes, functions, interfaces, types, variables)

### What Triggers a Multiple Exports Violation?

The plugin detects these export patterns:

```javascript
// ❌ Multiple class exports
export class UserService {}
export class OrderService {}

// ❌ Multiple function exports
export function validateUser() {}
export function validateOrder() {}

// ❌ Mixed export types
export class MyClass {}
export interface MyInterface {}
export const myConstant = 42;

// ❌ Multiple variable exports
export const API_URL = 'https://api.example.com';
export const API_KEY = 'secret';
```

### What's Allowed?

```javascript
// ✅ Single export per file
export class UserService {}

// ✅ Single default export
export default class UserService {}

// ✅ Single named export with multiple declarations
export const { API_URL, API_KEY } = config;

// ✅ Barrel files (index.ts/index.js) - automatically exempted
export { UserService } from './user-service';
export { OrderService } from './order-service';
export { ProductService } from './product-service';
```

### Barrel File Detection

Files are automatically detected as barrel files and exempted if:

- Filename is `index.ts`, `index.js`, `index.tsx`, or `index.jsx`
- File contains only re-export statements (`export { ... } from '...'`)
- Configuration option `ignoreBarrelFiles` is `true` (default)

### Configuration Presets

- **Recommended**: Standard settings for most projects
  - All export types checked
  - Barrel files exempted
  - Error severity level

- **Strict**: Stricter settings for critical codebases
  - All export types checked
  - No barrel file exemption
  - Error severity level

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## Publishing

The package is automatically published to GitHub Packages when pushing to any branch:

- `main` branch: Publishes the version from package.json
- Other branches: Publishes a prerelease version with branch name and timestamp

## License

ISC
