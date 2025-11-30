import type { TargetDeviceProfile } from '~/types'
import config from '~/config'

const CLIENT_ID = 'opfs/0.0.0'

export interface BuildRequest {
  version: string
  target: string
  profile: string
  packages: string[]
  defaults: string
  rootfs_size_mb: number | null
}

interface BaseBuildingInfo {
  detail: string
  status: number
  enqueued_at: string
  request_hash: string
}

interface QueuedBuildingInfo extends BaseBuildingInfo {
  detail: 'queued'
  queue_position: number
}

export type ImageBuilderStatus =
  | 'init'
  | 'container_setup'
  | 'validate_revision'
  | 'validate_manifest'
  | 'building_image'
  | 'signing_images'
  | 'done'
  | 'failed'

interface BaseRunBuildingInfo extends BaseBuildingInfo {
  imagebuilder_status: ImageBuilderStatus
  stdout?: string
  stderr?: string
  build_cmd?: string[]
}

interface StartedBuildingInfo extends BaseRunBuildingInfo {
  detail: 'started'
}

interface DoneBuildingInfo extends BaseRunBuildingInfo, TargetDeviceProfile {
  detail: 'done'

  /** package versions */
  manifest: Record<string, string>

  bin_dir: string
  build_at: string
}

interface FailedBuildingInfo extends BaseBuildingInfo {
  detail: 'failed'
  stderr: string
}

export type BuildingInfo = QueuedBuildingInfo | StartedBuildingInfo | DoneBuildingInfo | FailedBuildingInfo

export async function requestBuild(request: BuildRequest): Promise<BuildingInfo> {
  const req = {
    ...request,
    diff_packages: true,
    client: CLIENT_ID,
  }

  const res = await fetch(`${config.ASU_URL}/api/v1/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Build request failed: ${res.statusText}`)
  }

  return await res.json()
}

export async function getBuildingInfo(hash: string): Promise<BuildingInfo> {
  const res = await fetch(`${config.ASU_URL}/api/v1/build/${hash}`)

  return await res.json()
}

export function buildImageBaseUrl(bin_dir: string) {
  return `${config.ASU_URL}/store/${bin_dir}/`
}

export function buildDeviceProfileUrl(versionPath: string, target: string, profile: string) {
  return `${config.ASU_URL}/json/v1/${versionPath}/targets/${target}/${profile}.json`
}
