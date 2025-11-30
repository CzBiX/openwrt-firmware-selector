import type { ProfileTitle } from '~/composables/api'

export function formatProfileTitle(title: ProfileTitle): string {
  if (title.title) {
    return title.title
  }

  return [
    title.vendor,
    title.model,
    title.variant,
  ].filter(Boolean).join(' ')
}

export function formatTimestamp(epochSeconds: number): string {
  const date = new Date(epochSeconds * 1000)
  return date.toLocaleString()
}
