<script setup lang="ts">
import config from '~/config'
</script>

<template>
  <header class="text-white px-4 bg-[--p-primary-500] flex min-h-16 items-center justify-between">
    <a :href="config.HOME_URL" target="_blank">
      <img src="/banner.svg" width="180" alt="Logo">
    </a>
    <LangSelect />
  </header>
</template>
