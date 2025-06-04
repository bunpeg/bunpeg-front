/** @type {import("eslint").Linter.Config} */
const config = {
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'project': true
  },
  'plugins': [
    '@typescript-eslint',
    'react',
    'react-hooks',
    '@stylistic',
  ],
  'extends': [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  'rules': {
    'object-curly-spacing': ['error', 'always'],
    '@stylistic/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        'prefer': 'type-imports',
        'fixStyle': 'inline-type-imports'
      }
    ],
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        'checksVoidReturn': {
          'attributes': false
        }
      }
    ],
    'quotes': [
      'error',
      'single',
      {
        'allowTemplateLiterals': true,
        'avoidEscape': true
      }
    ],
    'jsx-quotes': [
      'error',
      'prefer-double'
    ],
    'object-curly-newline': 'off',
    'no-confusing-arrow': 'off',
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
    'operator-linebreak': [
      'error',
      'after', {
        'overrides': {
          '?': 'before',
          ':': 'before'
        }
      }
    ],
    'keyword-spacing': ['error', { 'before': true }],
    'react/display-name': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-uses-react': 'off',
    'react/jsx-closing-bracket-location': [2, 'tag-aligned'],
    'react/jsx-max-props-per-line': [2, { 'when': 'multiline' }],
    'react/jsx-first-prop-new-line': [2, 'multiline'],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/button-has-type': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/order': ['error', {
      'newlines-between': 'always',
      'groups': [
        ['builtin', 'external'],
        ['internal', 'index', 'parent', 'sibling']
      ]
    }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_',
      'destructuredArrayIgnorePattern': '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/member-delimiter-style': 'error',
    'indent': ['error', 2, { 'SwitchCase': 1 }]
  }
}
module.exports = config;
