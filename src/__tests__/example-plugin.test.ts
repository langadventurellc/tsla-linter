import { RuleTester } from 'eslint';
import { examplePlugin } from '../linters/example-plugin';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('example-plugin', () => {
  describe('no-foo rule', () => {
    const rule = examplePlugin.rules['no-foo'];

    ruleTester.run('no-foo', rule, {
      valid: [
        {
          code: 'const bar = 1;',
        },
        {
          code: 'function baz() {}',
        },
      ],
      invalid: [
        {
          code: 'const foo = 1;',
          errors: [
            {
              message: 'Avoid using "foo" as an identifier',
            },
          ],
        },
        {
          code: 'function foo() {}',
          errors: [
            {
              message: 'Avoid using "foo" as an identifier',
            },
          ],
        },
      ],
    });
  });
});
