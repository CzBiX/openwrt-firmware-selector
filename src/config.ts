import { parsePackages } from './utils/packages'

export default {
  BRAND_NAME: import.meta.env.VITE_BRAND_NAME || 'OpenWrt',
  HOME_URL: import.meta.env.VITE_HOME_URL || 'https://openwrt.org',
  DOWNLOAD_URL: import.meta.env.VITE_DOWNLOAD_URL || 'https://downloads.openwrt.org',
  ASU_URL: import.meta.env.VITE_ASU_URL || 'https://sysupgrade.openwrt.org',
  GITHUB_REPO: import.meta.env.VITE_GITHUB_REPO || 'CzBiX/openwrt-firmware-selector',

  RECENT_MAJOR_VERSION: Number.parseInt(import.meta.env.VITE_RECENT_MAJOR_VERSION) || 23,
  RECOMMENDED_PACKAGES: parsePackages(import.meta.env.VITE_RECOMMENDED_PACKAGES || 'luci'),
}
