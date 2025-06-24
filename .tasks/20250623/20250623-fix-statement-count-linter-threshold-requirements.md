# Feature

Fix the statement count linter threshold configuration to properly enforce code complexity limits.

## Requirements:

- The current ESLint configuration doesn't work as expected
  - since the rule is set to "error", it will never warn, only error
- The thresholds for the statement count rules need to be adjusted to ensure they provide appropriate warnings and errors
- Each existing rule needs to be split into two separate rules - one for warning and one for error

## See Also:

Existing ESLint configuration for statement count and multiple exports plugins.

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
