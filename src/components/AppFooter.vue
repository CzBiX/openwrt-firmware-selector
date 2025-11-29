<script setup lang="ts">
import config from '~/config'
</script>

<template>
  <footer class="text-sm color-[--p-text-muted-color] mt-8 p-2 flex justify-center">
    <a :href="config.DOWNLOAD_URL">{{ $t('allDownloads') }}</a>
    <Divider layout="vertical" />
    <!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
    <a :href="`https://github.com/${config.GITHUB_REPO}`">GitHub</a>
    <Divider layout="vertical" />
    <span>Release 0.0.0</span>
    <!-- eslint-enable @intlify/vue-i18n/no-raw-text -->
  </footer>
</template>
