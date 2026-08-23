import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

const config = [
  {
    files: ['**/*.js', '**/*.ts'],
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      ...eslint.configs.recommended.rules,
      // Avoid conflicts with Prettier
      // https://github.com/prettier/eslint-config-prettier#no-unexpected-multiline
      'no-unexpected-multiline': 'off',
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
]

export default config
