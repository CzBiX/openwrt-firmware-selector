import antfu from '@antfu/eslint-config'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default antfu(
  {
    unocss: true,
    formatters: true,
    pnpm: true,
    vue: {
      overrides: {
        'vue/max-attributes-per-line': ['warn', {
          singleline: 3,
        }],
      },
    },
    lessOpinionated: true,
  },
  vueI18n.configs.recommended,
  {
    rules: {
      '@intlify/vue-i18n/no-raw-text': ['warn', {
        ignorePattern: '^[-#:()&]+$',
      }],
      '@intlify/vue-i18n/no-unused-keys': [
        'warn',
        {
          src: './src',
          extensions: ['.ts', '.vue'],
        },
      ],
      '@intlify/vue-i18n/key-format-style': 'error',
      'antfu/top-level-function': 'error',
      'style/curly-newline': ['error', 'always'],
      'style/brace-style': 'error',
    },
    settings: {
      'vue-i18n': {
        localeDir: './locales/*.{yml}',
      },
    },
  },
)
