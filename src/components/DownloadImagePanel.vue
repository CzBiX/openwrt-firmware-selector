<script setup lang="ts">
import type { ImageInfo } from '~/types'

const props = defineProps<{
  images: ImageInfo[]
  targetUrl: string
}>()

function getImageLabel(image: ImageInfo) {
  let label = image.type
  const otherImages = props.images.filter(img => img.type === image.type) || []
  if (otherImages.length <= 1) {
    return label
  }

  label += ` (${image.filesystem})`

  return label
}

const sortedImages = computed(() => {
  const typePrecedence = ['sysupgrade', 'factory', 'uboot', 'rootfs']

  const tmp = props.images

  tmp.sort((a, b) => {
    const typeAIndex = typePrecedence.findIndex(t => a.type.includes(t))
    const typeBIndex = typePrecedence.findIndex(t => b.type.includes(t))

    if (typeAIndex === typeBIndex) {
      const diff = a.type.localeCompare(b.type)
      if (diff !== 0) {
        return diff
      }

      return (a.filesystem ?? '').localeCompare(b.filesystem ?? '')
    }

    if (typeAIndex === -1) {
      return 1
    }
    if (typeBIndex === -1) {
      return -1
    }

    return typeAIndex - typeBIndex
  })

  return tmp
})
</script>

<template>
  <Fieldset :legend="$t('downloadImages')">
    <table class="w-full">
      <tbody>
        <tr v-for="value in sortedImages" :key="value.name" class="border-b border-b-[--p-content-border-color] last:border-none">
          <td class="py-4">
            <Button
              as="a"
              class="w-max"
              :href="`${props.targetUrl}/${value.name}`"
              icon="i-carbon:download"
              :label="getImageLabel(value)"
            />
          </td>
          <td class="py-4 ps-4 break-all">
            <div class="flex flex-col">
              <div class="text-sm color-[--p-text-muted-color]">
                <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
                <span>sha256: <span class="font-mono">{{ value.sha256 }}</span></span>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </Fieldset>
</template>
