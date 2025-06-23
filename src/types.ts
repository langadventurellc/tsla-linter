import { Rule } from 'eslint';

export interface ESLintPlugin {
  rules: Record<string, Rule.RuleModule>;
  configs?: Record<string, unknown>;
}
