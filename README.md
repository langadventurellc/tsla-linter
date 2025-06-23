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

This package provides ESLint plugins for enforcing code quality standards. The main plugin is the **Statement Count Plugin** which helps maintain code readability by limiting the number of executable statements in functions and classes.

### Basic Usage

```javascript
// eslint.config.js
const { statementCountPlugin } = require('@langadventurellc/tsla-linter');

module.exports = [
  {
    plugins: {
      'statement-count': statementCountPlugin,
    },
    rules: {
      'statement-count/function-statement-count': 'warn',
      'statement-count/class-statement-count': 'warn',
    },
  },
];
```

### Configuration Options

Both rules support configurable thresholds:

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

### Preset Configurations

The plugin includes preset configurations for common use cases:

```javascript
// Use recommended settings
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
    },
    rules: {
      'statement-count/function-statement-count': 'warn',
      'statement-count/class-statement-count': 'warn',
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
