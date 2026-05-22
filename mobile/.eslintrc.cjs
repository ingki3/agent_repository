/**
 * ESLint config — see TECH_SPEC.md §11.1.
 *
 * - `@react-native/eslint-config` provides the React Native / Hermes baseline.
 * - `eslint-plugin-import` enforces import ordering and the Clean Architecture
 *   layer boundaries via `no-restricted-paths` (TECH §2.3).
 * - `eslint-config-prettier` is last to disable rules that conflict with Prettier.
 */
module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:import/recommended', 'plugin:import/typescript', 'prettier'],
  plugins: ['import', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: false,
  },
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'babel.config.js',
    'metro.config.js',
    '.eslintrc.cjs',
    '*.config.js',
  ],
  rules: {
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    /**
     * Inline / unused style rules from @react-native/eslint-config flag a lot of
     * BIZ-230 mockup code that is intentionally inline. Disable at the project
     * level for now; tighten when the mockup screens are migrated to the new
     * Clean Architecture layout in M1-* follow-ups.
     */
    'react-native/no-inline-styles': 'off',
    'react-native/no-unused-styles': 'off',
    'react-native/sort-styles': 'off',
    /**
     * Clean Architecture layer boundary enforcement (TECH §2.3).
     * - domain layer: pure TS, must not import RN/Expo/UI/infra/application/lib.
     * - application layer: may import domain only; must NOT import infrastructure
     *   (use ports/interfaces instead) or ui.
     * - ui/app layer may import application + domain + lib. infrastructure should
     *   only be wired in app/_layout (DI root) — flagged via warn-level for now.
     */
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/domain',
            from: ['./src/application', './src/infrastructure', './src/ui', './src/lib', './app'],
            message: 'domain layer must be pure (no app/infra/ui/lib imports)',
          },
          {
            target: './src/application',
            from: ['./src/infrastructure', './src/ui', './app'],
            message: 'application must depend on ports, not on infrastructure/ui directly',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
    {
      /**
       * BIZ-230 mockup screens (moved into `(main)/` by BIZ-268 foundation)
       * still use inline FlatList renderItem components. They are scheduled to
       * be rewritten to the TECH §2.2 layout in M1 sub 4 / sub 5 / sub 6.
       * Until then, suppress the unstable-nested-components warning here only.
       */
      files: [
        'app/(main)/inbox.tsx',
        'app/(main)/buddies.tsx',
        'app/(main)/chat/**',
        'app/(main)/add-buddy.tsx',
      ],
      rules: {
        'react/no-unstable-nested-components': 'off',
      },
    },
  ],
};
