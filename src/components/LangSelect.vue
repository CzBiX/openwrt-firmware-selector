<script setup lang="ts">
import type { Popover, PopoverMethods } from 'primevue'
import LANGS from '~/langs.json'
import { loadLanguageAsync } from '~/modules/i18n'

const currentLang = useLocalStorage('lang', '')
const avalilableLangs = Object.entries(LANGS).map(([code, name]) => ({
  label: name,
  value: code,
})).toSorted((a, b) => a.value.localeCompare(b.value))

const popoverRef = ref<PopoverMethods>()

function getDefaultLocale() {
  const navLangs = navigator.languages.map(lang => lang.toLowerCase())

  // Try matching the full locale first (e.g., "en-US")
  for (const lang of navLangs) {
    if (lang in LANGS) {
      return lang
    }
  }

  // Try matching only the first part of the locale (e.g., "en" from "en-US")
  for (const lang of navLangs) {
    const shortLang = lang.split('-')[0]
    if (shortLang && shortLang in LANGS) {
      return shortLang
    }
  }

  return 'en'
}

if (!(currentLang.value in LANGS)) {
  currentLang.value = getDefaultLocale()
}

watch(currentLang, (newLang) => {
  loadLanguageAsync(newLang)
}, {
  immediate: true,
})
</script>

<template>
  <Button icon="i-carbon:translate" :aria-label="$t('language')" @click="popoverRef?.show($event)" />
  <Popover ref="popoverRef" unstyled>
    <Listbox
      v-model="currentLang"
      :options="avalilableLangs"
      option-label="label"
      option-value="value"
      @update:model-value="popoverRef?.hide()"
    />
  </Popover>
</template>
