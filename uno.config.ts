import {
  defineConfig,
  presetIcons,
  presetWind4,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
  },
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
      },
    }),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  theme: {
  },
})
