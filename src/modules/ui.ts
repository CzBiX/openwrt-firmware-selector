import type { App } from 'vue'
import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import PrimeVue, { type PrimeVueConfiguration } from 'primevue/config'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: palette('#0080b3'),
    colorScheme: {
      dark: {
        primary: {
          contrastColor: '{surface-100}',
        },
      },
    },
  },
})

export const config: PrimeVueConfiguration = {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
}

export function install(app: App) {
  app.use(PrimeVue, config)
}
