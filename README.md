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

Add the plugin to your ESLint configuration:

```javascript
// eslint.config.js
import tslaLinter from '@langadventurellc/tsla-linter';

export default [
  {
    plugins: {
      'tsla': tslaLinter
    },
    rules: {
      'tsla/no-foo': 'error'
    }
  }
];
```

## Available Rules

- `tsla/no-foo`: Disallows variables or functions named 'foo'

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