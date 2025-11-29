import path from 'node:path'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    Vue(),
    VueI18n({
      include: path.resolve(__dirname, 'locales/**'),
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-i18n',
        '@vueuse/core',
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    Components({
      dts: true,
      resolvers: [
        PrimeVueResolver(),
      ],
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    UnoCSS(),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'primevue': ['primevue'],
          'primevue-themes': ['@primeuix/themes', '@primeuix/themes/aura'],
          'vue': ['vue', 'vue-i18n'],
        },
      },
    },
  },

  // https://github.com/vitest-dev/vitest
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
})
