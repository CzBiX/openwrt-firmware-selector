import { mount } from '@vue/test-utils'

import { expect, it } from 'vitest'
import DownloadImagePanel from '~/components/DownloadImagePanel.vue'

it('renders images by order', () => {
  const wrapper = mount(DownloadImagePanel, {
    props: {
      targetUrl: 'https://example.com',
      images: [
        {
          name: 'image1.img',
          sha256: 'abc123',
          type: 'rootfs',
        },
        {
          name: 'image2.img',
          sha256: 'def456',
          type: 'sysupgrade',
        },
        {
          name: 'image3.img',
          sha256: 'ghi789',
          type: 'factory-ubi',
        },
        {
          name: 'image4.img',
          sha256: 'jkl012',
          type: 'factory',
        },
        {
          name: 'image5.img',
          sha256: 'mno345',
          type: 'other',
        },
      ],
    },
  })

  expect(wrapper.findAll('a').map(a => a.text())).toEqual([
    'sysupgrade',
    'factory',
    'factory-ubi',
    'rootfs',
    'other',
  ])
})

it('handle images with same type', () => {
  const wrapper = mount(DownloadImagePanel, {
    props: {
      targetUrl: 'https://example.com',
      images: [
        {
          filesystem: 'squashfs',
          name: 'image1.img',
          sha256: 'abc123',
          type: 'rootfs',
        },
        {
          filesystem: 'ext4',
          name: 'image2.img',
          sha256: 'def456',
          type: 'rootfs',
        },
      ],
    },
  })

  expect(wrapper.findAll('a').map(a => a.text())).toEqual([
    'rootfs (ext4)',
    'rootfs (squashfs)',
  ])
})
