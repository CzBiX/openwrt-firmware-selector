<script setup lang="ts">
import type { DeviceProfile, ImageInfo } from '~/types'
import { buildTargetUrl } from '~/utils/api'
import { formatProfileTitle, formatTimestamp } from '~/utils/formaters'

const props = defineProps<{
  version: string
  profile: DeviceProfile
}>()

const {
  data,
  error,
} = useTargetDeviceProfile(props.version, props.profile.target, props.profile.id)

const targetUrl = shallowRef(buildTargetUrl(props.version, props.profile.target))

const wikiUrl = computed(() => {
  return `https://openwrt.org/?do=search&q=${encodeURIComponent(`${props.profile.title} @toh`)}`
})

const profileUrl = computed(() => {
  const params = new URLSearchParams({
    id: props.profile.id,
    version: props.version,
  })

  return `?${params.toString()}`
})

const profileTitles = computed(() => {
  return data.value?.titles.map(formatProfileTitle)
})

const hasCustomBuild = ref(false)
const customBuildInfo = ref<{
  baseUrl: string
  images: ImageInfo[]
} | null>(null)

function handleBuildStarted() {
  hasCustomBuild.value = true
  customBuildInfo.value = null
}
</script>

<template>
  <Fieldset :legend="$t('buildInfo')">
    <table v-if="data" class="text-left [&_th]:pr-16">
      <tbody>
        <tr>
          <th class="vertical-top">
            {{ $t('model') }}
          </th>
          <td>
            <p v-for="title in profileTitles" :key="title">
              {{ title }}
            </p>
          </td>
        </tr>
        <tr>
          <th>{{ $t('platform') }}</th>
          <td>{{ data.target }} ({{ data.arch_packages }})</td>
        </tr>
        <tr>
          <th>{{ $t('version') }}</th>
          <td>{{ data.version_number }} ({{ data.version_code }})</td>
        </tr>
        <tr>
          <th>{{ $t('kernel') }}</th>
          <td>{{ data.linux_kernel.version }}-{{ data.linux_kernel.release }}</td>
        </tr>
        <tr>
          <th>{{ $t('date') }}</th>
          <td>{{ formatTimestamp(data.source_date_epoch) }}</td>
        </tr>
        <tr>
          <th>{{ $t('links') }}</th>
          <td>
            <div class="flex gap-4 items-center">
              <a
                class="i-carbon:folder"
                :href="targetUrl"
                target="_blank"
                :title="$t('downloadPage')"
              />
              <a
                class="i-carbon:wikis"
                :href="wikiUrl"
                target="_blank"
                :title="$t('deviceWiki')"
              />
              <a class="i-carbon:direct-link" :href="profileUrl" :title="$t('directLink')" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <Message v-else-if="error" severity="warn">
      {{ $t('error.fetchBuildInfoFailed') }}: {{ error.message }}
    </Message>
    <div v-else class="flex flex-col gap-2">
      <Skeleton width="30rem" />
      <Skeleton width="10rem" />
      <Skeleton width="20rem" />
      <Skeleton width="25rem" />
    </div>
  </Fieldset>

  <template v-if="data">
    <CustomBuild :default-packages="data.default_packages" :profile-packages="data.device_packages">
      <template #footer="{ params }">
        <ImageBuilder
          :request="{
            version: props.version,
            target: props.profile.target,
            profile: props.profile.id,
            defaults: '',
            packages: [],
            rootfs_size_mb: null,
            ...params,
          }"
          @build-started="handleBuildStarted"
          @build-finished="customBuildInfo = $event"
        />
      </template>
    </CustomBuild>
    <DownloadImagePanel v-if="customBuildInfo" :images="customBuildInfo.images" :target-url="customBuildInfo.baseUrl" />
    <DownloadImagePanel v-else-if="!hasCustomBuild" :images="data.images" :target-url="targetUrl" />
  </template>
</template>
