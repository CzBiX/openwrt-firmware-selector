<script setup lang="ts">
import type { ProfileSummary } from '~/composables/api'
import type { DeviceProfile } from '~/types'
import fuzzysort from 'fuzzysort'
import config from '~/config'
import { formatProfileTitle } from '~/utils/formaters'

const selectedVersion = defineModel<string | undefined>('version', {
  required: true,
})
const selectedProfile = defineModel<DeviceProfile | undefined>('profile', {
  required: true,
})

const searchParams = useUrlSearchParams<{
  version?: string
  id?: string
}>()

const {
  data: versionResult,
  isFetching: isVersionsFetching,
} = useVersions()

watch(versionResult, (newVal) => {
  if (newVal && !selectedVersion.value) {
    if (searchParams.version) {
      // Validate version from URL
      if (newVal.versions_list.includes(searchParams.version)) {
        selectedVersion.value = searchParams.version
        return
      }

      // Invalid version in URL, clear it
      searchParams.version = undefined
    }

    selectedVersion.value = newVal.stable_version
  }
})

const allVersions = computed(() => {
  const serverList = versionResult.value?.versions_list || []
  const stableVersion = versionResult.value?.stable_version

  return [{
    value: 'snapshot',
    type: 'snapshot',
  }].concat(
    serverList.filter((version) => {
      if (!version.includes('.')) {
        return true
      }
      const majorVersion = version.split('.')[0]
      if (!majorVersion?.match(/^\d+$/)) {
        return true
      }

      // Only recent major versions
      return Number.parseInt(majorVersion) >= config.RECENT_MAJOR_VERSION
    }).map(version => ({
      value: version,
      type: version === stableVersion ? 'stable' : 'old',
    })),
  )
})

const {
  data: profilesResponse,
  isFetching: isProfilesFetching,
} = useProfiles(selectedVersion)

const allProfiles = computed(() => {
  const arr = profilesResponse.value?.profiles.flatMap(profile => convertToDeviceProfile(profile)) || []
  arr.sort((a, b) => a.title.localeCompare(b.title))

  // Some models exist in multiple targets when
  // a target is in the process of being renamed.
  // Appends target in brackets to make title unique.
  const titleToProfile = {} as Record<string, DeviceProfile>
  const dupTitles = new Set<string>()

  for (const profile of arr) {
    const existingProfile = titleToProfile[profile.title]
    if (existingProfile) {
      if (!dupTitles.has(profile.title)) {
        existingProfile.title += ` (${existingProfile.target})`
        dupTitles.add(profile.title)
      }
      profile.title += ` (${profile.target})`

      // Some targets missing variant, append ID as last resort
      if (profile.title === existingProfile.title) {
        existingProfile.title += ` [${existingProfile.id}]`
        profile.title += ` [${profile.id}]`
      }
    }
    else {
      titleToProfile[profile.title] = profile
    }
  }

  if (dupTitles.size > 0) {
    console.warn('Duplicate titles:', dupTitles)
  }

  return arr
})

function convertToDeviceProfile(profile: ProfileSummary): DeviceProfile[] {
  return profile.titles.map(title => ({
    id: profile.id,
    title: formatProfileTitle(title),
    target: profile.target,
  }))
}

interface ProfileOption {
  obj: DeviceProfile
  label: string
}

const filteredProfiles = shallowRef<ProfileOption[]>([])
watch(allProfiles, (newVal) => {
  if (newVal) {
    filteredProfiles.value = newVal.map(profile => ({
      obj: profile,
      label: profile.title,
    }))

    if (!selectedProfile.value && searchParams.id) {
      const matchedProfile = newVal.find(p => p.id === searchParams.id)
      if (matchedProfile) {
        selectedProfile.value = matchedProfile
      }
    }
  }
})

function searchProfile(query: string) {
  filteredProfiles.value = fuzzysort.go(query, allProfiles.value, {
    key: 'title',
    threshold: 0.4,
    all: true,
  }).map(result => ({
    obj: result.obj,
    label: result.highlight(),
  }))
}

function handleProfileChange(profile: ProfileOption | string | null) {
  if (!profile || typeof profile === 'string') {
    selectedProfile.value = undefined
  }
  else {
    selectedProfile.value = profile.obj
  }
}

onUnmounted(() => {
  fuzzysort.cleanup()
})
</script>

<template>
  <div class="flex gap-2">
    <AutoComplete
      :model-value="selectedProfile"
      class="flex-1"
      :loading="isProfilesFetching"
      :suggestions="filteredProfiles"
      fluid
      show-clear
      scroll-height="20rem"
      :placeholder="$t('model')"
      :delay="100"
      complete-on-focus
      option-label="title"
      @update:model-value="handleProfileChange"
      @complete="searchProfile($event.query)"
    >
      <template #option="{ option }">
        <span v-html="option.label" />
      </template>
    </AutoComplete>
    <Select
      v-model="selectedVersion"
      scroll-height="20rem"
      :options="allVersions"
      option-label="value"
      option-value="value"
      :loading="isVersionsFetching"
      :placeholder="$t('version')"
    >
      <template #option="{ option }">
        <span>{{ option.value }}</span>
        <Tag v-if="option.type === 'stable'" class="ml-1" rounded>
          {{ $t('tag.stable') }}
        </Tag>
      </template>
    </Select>
  </div>
</template>
