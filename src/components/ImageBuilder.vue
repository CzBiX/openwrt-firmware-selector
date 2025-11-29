<script setup lang="ts">
import type { ImageInfo } from '~/types'
import type { BuildingInfo, BuildRequest } from '~/utils/asu'
import { buildImageBaseUrl, getBuildingInfo, requestBuild } from '~/utils/asu'
import { delay } from '~/utils/promise'

const props = defineProps<{
  request: BuildRequest
}>()

const emit = defineEmits<{
  buildStarted: []
  buildFinished: [info: { baseUrl: string, images: ImageInfo[] }]
}>()

const building = ref(false)

const error = ref<string | null>(null)
const buildingInfo = shallowRef<BuildingInfo | null>(null)

const progress = computed(() => {
  const result = buildingInfo.value
  if (!result) {
    return 0
  }
  switch (result.detail) {
    case 'queued':
      return 10
    case 'started':
      switch (result.imagebuilder_status) {
        case 'init':
          return 20
        case 'container_setup':
          return 30
        case 'validate_revision':
          return 40
        case 'validate_manifest':
          return 50
        case 'building_image':
          return 60
        case 'signing_images':
          return 80
        case 'done':
          return 100
        case 'failed':
          return 100
        default:
          return 0
      }
    case 'failed':
    case 'done':
      return 100
    default:
      return 0
  }
})

function handleBuildingInfo(info: BuildingInfo) {
  buildingInfo.value = info

  switch (info.detail) {
    case 'started':
    case 'queued':
      // still building
      return false
    case 'failed':
      error.value = info.stderr
      return true
    case 'done': {
      const baseUrl = buildImageBaseUrl(info.bin_dir)
      emit('buildFinished', {
        baseUrl,
        images: info.images,
      })
      return true
    }
  }
}

async function handleRequestBuild() {
  building.value = true
  error.value = null
  buildingInfo.value = null

  emit('buildStarted')

  try {
    while (true) {
      let info: BuildingInfo
      // TS cannot infer the type here
      const oldInfo = buildingInfo.value as BuildingInfo | null
      if (oldInfo) {
        info = await getBuildingInfo(oldInfo.request_hash)
      }
      else {
        info = await requestBuild(props.request)
      }

      const isDone = handleBuildingInfo(info)
      if (isDone) {
        break
      }

      await delay(5000)
    }
  }
  catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message
    }
    else {
      error.value = String(e)
    }
  }
  finally {
    building.value = false
  }
}

const sortedManifest = computed(() => {
  const result = buildingInfo.value
  if (result && 'manifest' in result) {
    return Object.entries(result.manifest).sort(([a], [b]) => a.localeCompare(b))
  }

  return null
})
</script>

<template>
  <div class="flex gap-4">
    <Button
      severity="warn"
      :loading="building"
      :label="$t('requestBuild')"
      icon="i-carbon:build-run"
      @click="handleRequestBuild"
    />
    <ProgressBar v-if="building || buildingInfo" :value="progress" class="flex-1 self-center" />
  </div>
  <Message v-if="error" severity="error">
    {{ error }}
  </Message>
  <Panel
    v-if="buildingInfo"
    :header="$t('buildOutput')"
    toggleable
    collapsed
  >
    <Tabs value="manifest">
      <TabList>
        <Tab v-if="sortedManifest" value="manifest">
          {{ $t('packageManifest') }}
        </Tab>
        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        <Tab value="stdout">
          stdout
        </Tab>
        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        <Tab value="stderr">
          stderr
        </Tab>
      </TabList>
      <TabPanels class="text-sm max-h-96 overflow-auto">
        <TabPanel value="stdout">
          <pre class="whitespace-pre-wrap" v-text="(buildingInfo as any)?.stdout" />
        </TabPanel>
        <TabPanel value="stderr">
          <pre class="whitespace-pre-wrap" v-text="(buildingInfo as any)?.stderr" />
        </TabPanel>
        <TabPanel v-if="sortedManifest" value="manifest">
          <p v-for="[pkg, version] of sortedManifest" :key="pkg">
            {{ pkg }}: {{ version }}
          </p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Panel>
</template>
