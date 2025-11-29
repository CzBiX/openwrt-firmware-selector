import type { App as VueApp } from 'vue'
import { createApp } from 'vue'
import App from './App.vue'

import './main.css'
import 'uno.css'

export default function install(app: VueApp) {
  Object.values(import.meta.glob<(app: VueApp) => void>('./modules/*.ts', { eager: true, import: 'install' }))
    .forEach(f => f(app))
}

const app = createApp(App)
install(app)
app.mount('#app')
