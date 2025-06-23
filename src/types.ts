import { Rule } from 'eslint';

export interface PluginConfig {
  rules: Record<string, [string, Record<string, unknown>]>;
}

export interface ESLintPlugin {
  rules: Record<string, Rule.RuleModule>;
  configs?: Record<string, PluginConfig>;
}
