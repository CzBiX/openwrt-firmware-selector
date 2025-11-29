import config from '~/config'

export function buildVersionPath(version: string) {
  return version === 'snapshot' ? 'snapshots' : `releases/${version}`
}

export function buildTargetUrl(version: string, target: string) {
  const path = buildVersionPath(version)
  return `${config.DOWNLOAD_URL}/${path}/targets/${target}`
}
