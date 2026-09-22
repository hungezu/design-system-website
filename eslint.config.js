import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-library', 'dist-types', 'dist-project-runtime', 'dist-project-types', 'artifacts/runtime-builds/**', 'artifacts/sizing-acceptance/**', 'consumer-project/dist', 'consumer-project/node_modules', 'artifacts/local-stable/package', 'consumer/dist', 'consumer/node_modules', 'storybook-static', 'src/runtime/vendor/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
