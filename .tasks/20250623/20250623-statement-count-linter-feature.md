# Statement Count Linter Feature Specification

## Overview

This feature introduces two ESLint rules to enforce statement count limits for functions and classes. These rules help maintain code readability and adherence to clean code principles by alerting developers when functions or classes become too complex. The rules will count only executable statements, provide configurable warning and error thresholds, and generate detailed error messages with location information.

## Functional Requirements

1. **Function Statement Count Rule** - Detect when functions exceed configurable statement thresholds
   - Support function declarations, function expressions, and arrow functions
   - Count only executable statements (not declarations or block statements)
   - Provide separate warning and error thresholds
   - Default thresholds: 25 statements for warning, 50 for error

2. **Class Statement Count Rule** - Detect when classes exceed configurable statement thresholds
   - Support class declarations and class expressions
   - Count executable statements across all class methods combined
   - Provide separate warning and error thresholds
   - Default thresholds: 200 statements for warning, 400 for error

3. **Statement Counting Logic**
   - Count only executable statements (expression statements, return statements, control flow statements)
   - Exclude pure declarations, block statements, and comments
   - Count statements within nested functions/classes toward their parent's total

4. **Error Reporting**
   - Generate descriptive messages with function/class name, location, current count, and threshold
   - Include refactoring suggestions in error messages
   - Report errors at the function/class declaration node

5. **Configuration Support**
   - Accept threshold configuration as object with warn/error properties
   - Support ESLint severity levels (off, warn, error)
   - Validate configuration to ensure warn threshold is less than error threshold

## Technical Requirements

1. **Plugin Architecture**
   - Create as ESLint plugin following project's established patterns
   - Export two separate rules: `function-statement-count` and `class-statement-count`
   - Include recommended configuration preset

2. **Technology Stack**
   - TypeScript for implementation
   - ESLint Rule API for rule creation
   - Jest for unit testing
   - Compatible with ESLint 7.0.0+

3. **Parser Compatibility**
   - Work with standard ESLint parser for JavaScript
   - Support TypeScript files when @typescript-eslint/parser is configured
   - No additional parser dependencies required

4. **AST Processing**
   - Use ESLint's AST visitor pattern
   - Traverse and count relevant statement nodes
   - Handle nested scopes appropriately

## User Stories

1. **As a developer**, I want to be warned when my functions exceed 25 statements so I can consider refactoring before they become too complex.

2. **As a developer**, I want to see an error when functions exceed 50 statements to enforce our team's code quality standards.

3. **As a team lead**, I want to configure custom thresholds for our project's specific needs through ESLint configuration.

4. **As a developer**, I want clear error messages that tell me exactly which function/class is too complex and by how much.

## Acceptance Criteria

1. Function statement count rule correctly identifies functions exceeding thresholds
   - ✓ Detects function declarations, expressions, and arrow functions
   - ✓ Counts only executable statements
   - ✓ Respects configured warning and error thresholds
   - ✓ Provides detailed error messages with location

2. Class statement count rule correctly identifies classes exceeding thresholds
   - ✓ Detects class declarations and expressions
   - ✓ Counts statements across all class methods
   - ✓ Respects configured warning and error thresholds
   - ✓ Provides detailed error messages with location

3. Configuration works as expected
   - ✓ Accepts object configuration with warn/error thresholds
   - ✓ Uses sensible defaults when not configured
   - ✓ Validates configuration (warn < error)

4. TypeScript support functions correctly
   - ✓ Rules work with TypeScript files when appropriate parser is configured
   - ✓ No errors thrown for TypeScript-specific syntax

5. All tests pass and meet quality standards
   - ✓ 100% code coverage for rule logic
   - ✓ Tests cover all statement types and edge cases
   - ✓ Linting and build checks pass

## Non-Goals

- Automatic code refactoring or fixes
- Statement counting for other constructs (modules, namespaces)
- Custom statement weighting or complexity calculations
- Integration with external code quality tools
- Support for ESLint versions below 7.0.0
- Parser-specific features or requirements

## Technical Considerations

1. **Dependencies**
   - No new runtime dependencies needed
   - Existing ESLint types and testing utilities sufficient

2. **Performance**
   - Rules should have minimal performance impact
   - Efficient AST traversal without unnecessary recursion
   - Early exit when not applicable

3. **Compatibility**
   - Must work with existing plugin structure
   - Follow established patterns from example-plugin.ts
   - Compatible with project's TypeScript configuration

4. **Edge Cases**
   - Empty functions/classes (0 statements)
   - Nested functions counting toward parent
   - Generator functions and async functions
   - Class static blocks and property initializers

## Success Metrics

1. **Functionality** - Both rules correctly identify statement count violations
2. **Accuracy** - Statement counting matches documented behavior with no false positives
3. **Performance** - Rules add less than 5% overhead to linting time
4. **Adoption** - Clear documentation enables easy configuration and use
5. **Quality** - Zero defects, 100% test coverage, all quality checks passing
