# Feature

Create an ESLint plugin that enforces statement count limits for functions and classes to maintain code readability and maintainability.

## Requirements:

- Implement ESLint plugin structure with proper exports and rule definitions
- Create rule to detect functions exceeding configurable statement threshold
- Create rule to detect classes exceeding configurable statement threshold
- Support both warning and error severity levels based on configuration
- Provide default thresholds
  - For warnings: 25 statements for functions, 200 for classes
  - For errors: 50 statements for functions, 400 for classes
- Allow threshold customization through ESLint configuration
- Support arrow functions, function declarations, and function expressions
- Support class declarations and class expressions
- Exclude comments and empty lines from statement count
- Generate descriptive error messages indicating current vs allowed statements
- Include fix suggestions or refactoring hints in error messages
- Support TypeScript syntax alongside JavaScript
- Write comprehensive unit tests for all rule variations
- Document plugin usage and configuration options

## See Also:

- /Users/zach/code/tsla-linter/src/linters/
- /Users/zach/code/tsla-linter/CLAUDE.md (quality standards section)
