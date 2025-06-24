# Feature Specification: Fix Statement Count Linter Threshold Configuration

## Overview

**Problem Statement:** The current statement count linter implementation has a fundamental ESLint configuration issue where rules configured with `'error'` severity will always report violations as errors, even when the rule logic attempts to report warnings for lower thresholds. This prevents proper progressive warning/error enforcement based on statement count thresholds.

**Solution Summary:** Restructure the statement count linter rules to properly support both warning and error thresholds by either fixing the combined rule approach or splitting into separate warning/error rules, replacing the existing broken implementation.

**Primary Goals:**

- Enable proper warning-level reporting for statement counts exceeding warning thresholds but below error thresholds
- Maintain the sophisticated statement counting logic and thresholds that already exist
- Provide clear, actionable feedback to developers about code complexity

## Functional Requirements

1. **Threshold-Based Reporting:** Rules must correctly report warnings for counts between warning and error thresholds, and errors for counts exceeding error thresholds
2. **Function Statement Counting:** Maintain existing function statement counting with configurable warning/error thresholds (defaults: 25 warn, 50 error)
3. **Class Statement Counting:** Maintain existing class statement counting with configurable warning/error thresholds (defaults: 200 warn, 300 error)
4. **Statement Type Recognition:** Preserve existing sophisticated statement type detection and counting logic
5. **Named/Anonymous Handling:** Continue providing appropriate error messages for both named and anonymous functions/classes
6. **Nested Function Exclusion:** Maintain existing behavior of excluding nested functions/classes from parent statement counts
7. **Configuration Validation:** Ensure warning thresholds are always less than error thresholds
8. **Detailed Reporting:** Preserve existing detailed statement type breakdown and location information

## Technical Requirements

**Technology Stack:**

- TypeScript 5.x with strict mode
- ESLint Rule API and plugin architecture
- ESTree AST node types
- Existing StatementCounter class and helper functions

**Implementation Approach:**

- **Primary:** Attempt to fix combined rules to work with proper ESLint severity levels
- **Fallback:** Split into separate warning/error rules if combined approach cannot be made to work properly

**Integration Points:**

- ESLint plugin system and rule registration
- Existing statement counting utilities in `statement-counter.ts`
- Plugin configuration presets (`recommended`, `strict`)

## User Stories

**As a developer using the linter:**

- I want to receive warnings when my functions approach complexity limits (25+ statements) so I can refactor before hitting hard limits
- I want to receive errors when my functions exceed acceptable complexity (50+ statements) to enforce code quality standards
- I want the same progressive warning/error system for classes (200+ warn, 300+ error)
- I want clear, actionable error messages that tell me exactly how many statements were found and what the thresholds are

**As a team lead configuring the linter:**

- I want to customize warning and error thresholds based on team standards
- I want preset configurations for common use cases (`recommended`, `strict`)
- I want the linter to prevent invalid configurations (e.g., warning threshold >= error threshold)

## Acceptance Criteria

1. **Warning Threshold Enforcement:** Functions/classes with statement counts between warning and error thresholds must generate ESLint warnings (not errors)
2. **Error Threshold Enforcement:** Functions/classes with statement counts exceeding error thresholds must generate ESLint errors
3. **Configuration Compatibility:** Rules must accept the same configuration format as existing implementation
4. **Message Quality:** Error/warning messages must include function/class name, statement count, threshold violated, and actionable advice
5. **Preset Functionality:** `recommended` and `strict` preset configurations must work correctly
6. **Test Coverage:** All existing test scenarios must pass with the corrected implementation
7. **Validation Logic:** Invalid configurations (warning >= error threshold) must be rejected with clear error messages

## Non-Goals

- Changing the statement counting logic or criteria for what constitutes a statement
- Modifying the StatementCounter class implementation
- Adding new configuration options beyond existing warning/error thresholds
- Supporting ESLint versions prior to current requirements
- Maintaining backward compatibility with the broken threshold behavior

## Technical Considerations

**ESLint Rule Architecture:**

- ESLint rule severity levels (`'off'`, `'warn'`, `'error'`) determine how violations are reported
- Rules cannot override the configured severity level when calling `context.report()`
- Solution requires either separate rules with different severities or a different reporting approach

**Existing Code Assets:**

- `StatementCounter` class with sophisticated counting logic can be reused as-is
- Helper functions `countStatementsInFunction` and `countStatementsInClass` are working correctly
- Message templates and configuration schemas can be largely preserved

**Testing Strategy:**

- Existing test suite covers statement counting accuracy and configuration scenarios
- Tests need updates to verify proper warning/error level reporting
- Integration tests should verify ESLint actually reports warnings vs errors correctly

**Migration Considerations:**

- Breaking change acceptable per requirements
- Plugin version bump required
- Documentation updates needed for new configuration patterns

## Success Metrics

1. **Functional Success:** ESLint reports warnings for threshold violations in warning range and errors for threshold violations in error range
2. **Configuration Success:** All existing configuration patterns work with corrected behavior
3. **Test Success:** 100% test pass rate with updated assertions for warning/error levels
4. **Integration Success:** Plugin works correctly when consumed by external ESLint configurations
5. **Performance Success:** No degradation in linting performance compared to current implementation
