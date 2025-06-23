# Feature

Add new ESLint linter that checks for multiple exported classes, functions, or interfaces in a single file.

## Requirements:

- Create new ESLint plugin that detects multiple export statements in a single file
- Check for multiple exported classes within the same file
- Check for multiple exported functions within the same file
- Check for multiple exported interfaces within the same file
- Don't check barrel files (index.ts or index.js files)
- Allow configuration to specify which export types to check (classes, functions, interfaces)
- Provide clear error messages indicating which exports violate the rule
- Include auto-fix suggestions when possible (e.g., suggest splitting into separate files)
- Support both named exports and default exports in violation detection
- Add comprehensive test suite covering various export scenarios
- Follow existing ESLint plugin patterns and conventions used in the codebase
- Integrate with the existing linter structure in `src/linters/`
- Document the rule configuration options and usage examples

## See Also:

- `src/linters/statement-count-plugin/` - Example of existing ESLint plugin structure
- `src/linters/example-plugin/` - Basic plugin template
- `CLAUDE.md` - Project conventions for one export per file
