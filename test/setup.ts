import { config } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import i18n from '~/modules/i18n'
import { config as uiConfig } from '~/modules/ui'

function setupVuePlugins() {
  config.global.plugins = [
    i18n,
    [PrimeVue, uiConfig],
  ]
}

setupVuePlugins()
