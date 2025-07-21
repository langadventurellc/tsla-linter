---
kind: task
id: T-add-constants-exclusion-option
title: Add constants exclusion option to multiple exports linter
status: open
priority: normal
prerequisites: []
created: '2025-07-21T00:11:04.914605'
updated: '2025-07-21T00:11:04.914605'
schema_version: '1.1'
---

## Context

The current multiple exports linter has a `checkVariables` option that controls whether variable/constant exports are checked. This is too broad - developers often need to export multiple constants from a single file (like configuration objects, error codes, or API endpoints) while still maintaining the one export per file rule for other types.

## Requirements

Add a new `excludeConstants` option to the multiple exports plugin that allows constants to be excluded from the one export per file check while still checking other variable types (let, var).

## Technical Approach

1. **Update MultipleExportsOptions interface** in `src/linters/multiple-exports-plugin/multiple-exports-plugin.ts`:
   - Add `excludeConstants?: boolean` option with default `false`
   - Update schema documentation

2. **Enhance export detection logic** in `src/linters/multiple-exports-plugin/export-detector.ts`:
   - Add function to detect if a variable declaration is a constant (`const` keyword)
   - Modify `detectExports` function to accept and use the new `excludeConstants` option
   - Update variable export detection to distinguish between constants and other variables

3. **Update filtering logic** in multiple-exports-plugin.ts:
   - Modify the `checkForViolations` function to filter out constants when `excludeConstants` is true
   - Ensure the filtering works with the existing `checkVariables` option

4. **Update configuration presets**:
   - Add `excludeConstants: false` to both `recommended` and `strict` configurations
   - Document the new option in the schema

## Implementation Details

### AST Analysis for Constants

- Check if `VariableDeclaration.kind === 'const'` to identify constants
- Ensure this works with both single and multiple declarators in one statement
- Handle edge cases like destructuring assignments

### Option Interaction

- When `checkVariables` is `false`, the `excludeConstants` option should have no effect
- When `checkVariables` is `true` and `excludeConstants` is `true`, only non-const variables should be flagged
- When both are `true`, const exports should be allowed while let/var exports are still flagged

## Acceptance Criteria

1. **New option available**: `excludeConstants` option is available in plugin configuration
2. **Constants excluded when enabled**: When `excludeConstants: true`, files with multiple const exports do not trigger violations
3. **Other variables still checked**: When `excludeConstants: true`, files with multiple let/var exports still trigger violations
4. **Backwards compatibility**: Existing configurations continue to work unchanged
5. **Option interaction works**: `excludeConstants` only takes effect when `checkVariables` is true
6. **Unit tests pass**: All existing tests continue to pass
7. **New functionality tested**: New unit tests cover the constants exclusion feature
8. **Configuration documented**: Schema includes proper documentation for the new option

## Testing Requirements

Write unit tests that verify:

- Multiple const exports are allowed when `excludeConstants: true`
- Multiple let/var exports are still flagged when `excludeConstants: true`
- Mixed const and let/var exports only flag the non-const exports
- Option has no effect when `checkVariables: false`
- Backwards compatibility with existing configurations
- Edge cases like destructuring and multiple declarators

## Files to Modify

- `src/linters/multiple-exports-plugin/multiple-exports-plugin.ts`
- `src/linters/multiple-exports-plugin/export-detector.ts`
- `src/__tests__/multiple-exports-plugin/multiple-exports-plugin.test.ts`
- Add new test file: `src/__tests__/multiple-exports-plugin/constants-exclusion.test.ts`

## Security Considerations

- Ensure AST parsing is safe and handles malformed code gracefully
- Validate the new option type and range in the schema
- No additional security concerns for this linting feature

### Log
