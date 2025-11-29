import type { TargetDeviceProfile } from '~/types'
import config from '~/config'
import { buildVersionPath } from '~/utils/api'
import { buildDeviceProfileUrl } from '~/utils/asu'

interface VersionsResponse {
  stable_version: string
  versions_list: string[]
}

export function useVersions() {
  return useFetch(`${config.DOWNLOAD_URL}/.versions.json`).json<VersionsResponse>()
}

export interface ProfileTitle {
  title?: string
  model: string
  vendor: string
  variant?: string
}

export interface ProfileSummary {
  id: string
  titles: ProfileTitle[]
  target: string
}

interface ProfileSummaryResponse {
  profiles: ProfileSummary[]
}

export function useProfiles(versionRef: Ref<string | undefined>) {
  const fetcher = useFetch(() => {
    const version = toValue(versionRef)!
    const path = buildVersionPath(version)
    return `${config.DOWNLOAD_URL}/${path}/.overview.json`
  }, {
    immediate: false,
  }).json<ProfileSummaryResponse>()

  watch(versionRef, (newVersion) => {
    if (newVersion) {
      fetcher.execute()
    }
  }, { immediate: true })

  return fetcher
}

export function useTargetDeviceProfile(versionRef: MaybeRef<string>, targetRef: MaybeRef<string>, deviceRef: MaybeRef<string>) {
  return useFetch(() => {
    const version = toValue(versionRef)
    const target = toValue(targetRef)
    const device = toValue(deviceRef)

    const versionPath = buildVersionPath(version)
    const url = buildDeviceProfileUrl(versionPath, target, device)
    return url
  }).json<TargetDeviceProfile>()
}
