export interface DeviceProfile {
  id: string
  title: string
  target: string
}

export interface ImageInfo {
  filesystem?: string
  name: string
  sha256: string
  type: string
}

export interface DeviceProfileDetails {
  device_packages: string[]
  image_prefix: string
  images: ImageInfo[]
  supported_devices: string[]
  titles: ProfileTitle[]
}

export interface TargetProfile {
  arch_packages: string
  linux_kernel: {
    release: string
    vermagic: string
    version: string
  }
  default_packages: string[]
  target: string
  source_date_epoch: number
  version_code: string
  version_number: string
}

export interface TargetDeviceProfile extends TargetProfile, DeviceProfileDetails {
  id: string
}
