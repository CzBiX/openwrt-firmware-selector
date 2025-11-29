<script setup lang="ts">
import type { DeviceProfile } from '~/types'
import config from '~/config'

const selectedVersion = shallowRef<string | undefined>(undefined)
const selectedProfile = shallowRef<DeviceProfile | undefined>(undefined)
</script>

<template>
  <section class="mx-auto p-4 flex flex-col gap-4 max-w-256">
    <h2 class="text-2xl font-bold">
      {{ $t('downloadFirmwareForDevice', { brand_name: config.BRAND_NAME }) }}
    </h2>
    <p>
      {{ $t('searchTips') }}
    </p>

    <ModelSelector v-model:version="selectedVersion" v-model:profile="selectedProfile" />
    <BuildSection
      v-if="!!selectedVersion && !!selectedProfile"
      :key="`${selectedVersion}-${selectedProfile.id}`"
      :version="selectedVersion"
      :profile="selectedProfile"
    />
  </section>
</template>
