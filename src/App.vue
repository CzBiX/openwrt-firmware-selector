<script setup lang="ts">
import config from './config'

const { t } = useI18n()
useTitle(() => {
  return t('pageTitle', { brand_name: config.BRAND_NAME })
})
</script>

<template>
  <AppHeader />
  <MainContent />
  <AppFooter />
</template>
