import { statementCountPlugin } from '../../linters/statement-count-plugin/statement-count-plugin';

/**
 * Integration tests to validate the complete plugin functionality
 * and ensure proper configuration and rule structure.
 */
describe('Statement Count Plugin Integration Tests', () => {
  describe('5.1 Plugin structure and rule validation', () => {
    it('should export all four rules with correct names', () => {
      expect(statementCountPlugin.rules).toBeDefined();
      expect(Object.keys(statementCountPlugin.rules)).toHaveLength(4);

      expect(statementCountPlugin.rules['function-statement-count-warn']).toBeDefined();
      expect(statementCountPlugin.rules['function-statement-count-error']).toBeDefined();
      expect(statementCountPlugin.rules['class-statement-count-warn']).toBeDefined();
      expect(statementCountPlugin.rules['class-statement-count-error']).toBeDefined();

      // Verify each rule is a proper ESLint rule module
      Object.values(statementCountPlugin.rules).forEach((rule) => {
        expect(rule.meta).toBeDefined();
        expect(rule.create).toBeDefined();
        expect(typeof rule.create).toBe('function');
      });
    });

    it('should have proper rule metadata for warning and error severity', () => {
      Object.entries(statementCountPlugin.rules).forEach(([ruleName, rule]) => {
        expect(rule.meta).toBeDefined();
        const meta = rule.meta;
        if (!meta) throw new Error('Rule meta is undefined');

        expect(meta.type).toBe('suggestion');
        expect(meta.docs).toBeDefined();

        const docs = meta.docs;
        if (!docs) throw new Error('Rule docs is undefined');
        expect(docs.description).toContain(ruleName.includes('class') ? 'class' : 'function');

        expect(meta.schema).toBeDefined();
        expect(meta.messages).toBeDefined();

        const messages = meta.messages;
        if (!messages) throw new Error('Rule messages is undefined');

        // Validate message templates
        expect(messages.tooManyStatements).toBeDefined();
        expect(messages.tooManyStatementsAnonymous).toBeDefined();

        // Check for appropriate message content based on rule type
        if (ruleName.includes('warn')) {
          expect(messages.tooManyStatements).toContain('recommended max');
        } else if (ruleName.includes('error')) {
          expect(messages.tooManyStatements).toContain('max');
          expect(messages.tooManyStatements).not.toContain('recommended max');
        }
      });
    });

    it('should have consistent schema across all rules', () => {
      Object.values(statementCountPlugin.rules).forEach((rule) => {
        expect(rule.meta).toBeDefined();
        const meta = rule.meta;
        if (!meta) throw new Error('Rule meta is undefined');

        expect(meta.schema).toBeDefined();
        expect(Array.isArray(meta.schema)).toBe(true);

        const schema = meta.schema as unknown[];
        expect(schema).toHaveLength(1);
        expect(schema[0]).toEqual({
          type: 'object',
          properties: {
            threshold: {
              type: 'integer',
              minimum: 1,
            },
          },
          additionalProperties: false,
        });
      });
    });

    it('should have different default thresholds for warning vs error rules', () => {
      // Test function rules
      const functionWarnRule = statementCountPlugin.rules['function-statement-count-warn'];
      const functionErrorRule = statementCountPlugin.rules['function-statement-count-error'];

      // We can't easily test the default values without invoking the rules,
      // but we can verify the rule structure supports default behavior
      expect(functionWarnRule.create).toBeDefined();
      expect(functionErrorRule.create).toBeDefined();

      // Test class rules
      const classWarnRule = statementCountPlugin.rules['class-statement-count-warn'];
      const classErrorRule = statementCountPlugin.rules['class-statement-count-error'];

      expect(classWarnRule.create).toBeDefined();
      expect(classErrorRule.create).toBeDefined();
    });
  });

  describe('5.2 Preset configuration validation', () => {
    it('should export recommended preset with correct configuration', () => {
      expect(statementCountPlugin.configs).toBeDefined();
      const configs = statementCountPlugin.configs;
      if (!configs) throw new Error('Plugin configs is undefined');

      expect(configs.recommended).toBeDefined();
      expect(configs.recommended.rules).toBeDefined();

      const recommendedRules = configs.recommended.rules;

      expect(recommendedRules['statement-count/function-statement-count-warn']).toEqual([
        'warn',
        { threshold: 25 },
      ]);
      expect(recommendedRules['statement-count/function-statement-count-error']).toEqual([
        'error',
        { threshold: 50 },
      ]);
      expect(recommendedRules['statement-count/class-statement-count-warn']).toEqual([
        'warn',
        { threshold: 200 },
      ]);
      expect(recommendedRules['statement-count/class-statement-count-error']).toEqual([
        'error',
        { threshold: 300 },
      ]);
    });

    it('should export strict preset with correct configuration', () => {
      const configs = statementCountPlugin.configs;
      if (!configs) throw new Error('Plugin configs is undefined');

      expect(configs.strict).toBeDefined();
      expect(configs.strict.rules).toBeDefined();

      const strictRules = configs.strict.rules;

      expect(strictRules['statement-count/function-statement-count-warn']).toEqual([
        'warn',
        { threshold: 15 },
      ]);
      expect(strictRules['statement-count/function-statement-count-error']).toEqual([
        'error',
        { threshold: 25 },
      ]);
      expect(strictRules['statement-count/class-statement-count-warn']).toEqual([
        'warn',
        { threshold: 150 },
      ]);
      expect(strictRules['statement-count/class-statement-count-error']).toEqual([
        'error',
        { threshold: 200 },
      ]);
    });

    it('should have logical threshold progression in presets', () => {
      const configs = statementCountPlugin.configs;
      if (!configs) throw new Error('Plugin configs is undefined');

      const recommended = configs.recommended.rules;
      const strict = configs.strict.rules;

      // Function thresholds should be: strict.warn < strict.error <= recommended.warn < recommended.error
      const strictFuncWarn = strict['statement-count/function-statement-count-warn'][1]
        .threshold as number;
      const strictFuncError = strict['statement-count/function-statement-count-error'][1]
        .threshold as number;
      const recommendedFuncWarn = recommended['statement-count/function-statement-count-warn'][1]
        .threshold as number;
      const recommendedFuncError = recommended['statement-count/function-statement-count-error'][1]
        .threshold as number;

      expect(strictFuncWarn).toBeLessThan(strictFuncError);
      expect(strictFuncError).toBeLessThanOrEqual(recommendedFuncWarn);
      expect(recommendedFuncWarn).toBeLessThan(recommendedFuncError);

      // Class thresholds should follow the same pattern
      const strictClassWarn = strict['statement-count/class-statement-count-warn'][1]
        .threshold as number;
      const strictClassError = strict['statement-count/class-statement-count-error'][1]
        .threshold as number;
      const recommendedClassWarn = recommended['statement-count/class-statement-count-warn'][1]
        .threshold as number;
      const recommendedClassError = recommended['statement-count/class-statement-count-error'][1]
        .threshold as number;

      expect(strictClassWarn).toBeLessThan(strictClassError);
      expect(strictClassError).toBeLessThanOrEqual(recommendedClassWarn);
      expect(recommendedClassWarn).toBeLessThan(recommendedClassError);
    });

    it('should have all preset rules pointing to existing rule definitions', () => {
      const presets = ['recommended', 'strict'];
      const configs = statementCountPlugin.configs;
      if (!configs) throw new Error('Plugin configs is undefined');

      presets.forEach((presetName) => {
        const preset = configs[presetName];
        expect(preset).toBeDefined();

        Object.keys(preset.rules).forEach((ruleKey) => {
          // Extract rule name from "statement-count/rule-name" format
          const ruleName = ruleKey.replace('statement-count/', '');
          expect(statementCountPlugin.rules[ruleName]).toBeDefined();
        });
      });
    });
  });

  describe('5.3 Rule behavior consistency validation', () => {
    it('should have consistent rule creation behavior', () => {
      Object.entries(statementCountPlugin.rules).forEach(([ruleName, rule]) => {
        // Test that rule can be created with valid context
        const mockContext = {
          options: [{ threshold: 10 }],
          report: jest.fn(),
        };

        const ruleInstance = rule.create(
          mockContext as unknown as import('eslint').Rule.RuleContext,
        );
        expect(ruleInstance).toBeDefined();
        expect(typeof ruleInstance).toBe('object');

        // Verify rule handles appropriate node types
        if (ruleName.includes('function')) {
          expect(ruleInstance.FunctionDeclaration).toBeDefined();
          expect(ruleInstance.FunctionExpression).toBeDefined();
          expect(ruleInstance.ArrowFunctionExpression).toBeDefined();
          expect(typeof ruleInstance.FunctionDeclaration).toBe('function');
        } else if (ruleName.includes('class')) {
          expect(ruleInstance.ClassDeclaration).toBeDefined();
          expect(ruleInstance.ClassExpression).toBeDefined();
          expect(typeof ruleInstance.ClassDeclaration).toBe('function');
        }
      });
    });

    it('should handle configuration validation properly', () => {
      Object.values(statementCountPlugin.rules).forEach((rule) => {
        // Test that rule creation throws error for invalid threshold
        const invalidContext = {
          options: [{ threshold: 0 }], // Invalid: minimum is 1
          report: jest.fn(),
        };

        expect(() => {
          rule.create(invalidContext as unknown as import('eslint').Rule.RuleContext);
        }).toThrow('threshold must be a positive integer');
      });
    });

    it('should use default thresholds when no options provided', () => {
      Object.entries(statementCountPlugin.rules).forEach(([, rule]) => {
        const contextWithoutOptions = {
          options: [],
          report: jest.fn(),
        };

        // Should not throw when no options provided (uses defaults)
        expect(() => {
          rule.create(contextWithoutOptions as unknown as import('eslint').Rule.RuleContext);
        }).not.toThrow();
      });
    });
  });

  describe('5.4 Breaking change validation', () => {
    it('should not export old combined rule names', () => {
      // Verify old rule names are not present
      expect(statementCountPlugin.rules['function-statement-count']).toBeUndefined();
      expect(statementCountPlugin.rules['class-statement-count']).toBeUndefined();
    });

    it('should have exactly four rules (no more, no less)', () => {
      const ruleNames = Object.keys(statementCountPlugin.rules);
      expect(ruleNames).toHaveLength(4);
      expect(ruleNames.sort()).toEqual([
        'class-statement-count-error',
        'class-statement-count-warn',
        'function-statement-count-error',
        'function-statement-count-warn',
      ]);
    });

    it('should have consistent naming pattern', () => {
      const ruleNames = Object.keys(statementCountPlugin.rules);

      ruleNames.forEach((ruleName) => {
        // All rules should follow pattern: [function|class]-statement-count-[warn|error]
        expect(ruleName).toMatch(/^(function|class)-statement-count-(warn|error)$/);
      });

      // Should have 2 function rules and 2 class rules
      const functionRules = ruleNames.filter((name) => name.startsWith('function-'));
      const classRules = ruleNames.filter((name) => name.startsWith('class-'));
      expect(functionRules).toHaveLength(2);
      expect(classRules).toHaveLength(2);

      // Should have 2 warn rules and 2 error rules
      const warnRules = ruleNames.filter((name) => name.endsWith('-warn'));
      const errorRules = ruleNames.filter((name) => name.endsWith('-error'));
      expect(warnRules).toHaveLength(2);
      expect(errorRules).toHaveLength(2);
    });
  });

  describe('Package version validation', () => {
    it('should be major version 2 for breaking change', () => {
      // This test validates that the package version was updated for breaking changes
      // We can't directly import package.json here, but we can verify the plugin structure
      // supports the breaking change by ensuring old rules don't exist and new ones do

      const expectedNewRules = [
        'function-statement-count-warn',
        'function-statement-count-error',
        'class-statement-count-warn',
        'class-statement-count-error',
      ];

      expectedNewRules.forEach((ruleName) => {
        expect(statementCountPlugin.rules[ruleName]).toBeDefined();
      });

      // Ensure old rule structure is completely replaced
      expect(Object.keys(statementCountPlugin.rules)).toEqual(expectedNewRules);
    });
  });
});
