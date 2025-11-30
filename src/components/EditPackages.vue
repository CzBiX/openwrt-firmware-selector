<script setup lang="ts">
import { $dt } from '@primeuix/themes'
import { computed, shallowRef } from 'vue'
import { parsePackages } from '~/utils/packages'

const props = defineProps<{
  defaultPackages: string[]
  profilePackages: string[]
}>()

const model = defineModel<string[]>({
  required: true,
})

const COMMIT_KEYS = ['Enter', ' ', ',']

interface PackageChip {
  name: string
  type?: 'default' | 'profile'
}

function buildChip(pkg: string): PackageChip {
  if (props.defaultPackages.includes(pkg)) {
    return { name: pkg, type: 'default' }
  }
  if (props.profilePackages.includes(pkg)) {
    return { name: pkg, type: 'profile' }
  }
  return { name: pkg }
}

function sortPackages(pkgs: string[]) {
  const predefined = [...props.defaultPackages, ...props.profilePackages]
  return pkgs.toSorted((a, b) => {
    const aIndex = predefined.indexOf(a)
    const bIndex = predefined.indexOf(b)

    if (aIndex === bIndex) {
      return a.localeCompare(b)
    }

    if (aIndex === -1) {
      return 1
    }
    if (bIndex === -1) {
      return -1
    }

    return aIndex - bIndex
  })
}

const sortedPackages = computed(() => {
  return sortPackages(model.value)
})

const chipItems = computed(() => {
  return sortedPackages.value.map(buildChip)
})

function updatePackages(pkgs: string[]) {
  model.value = sortPackages(pkgs)
}

function addPackage(input: string) {
  const value = input.trim()
  if (!value) {
    return
  }

  const existing = sortedPackages.value
  if (existing.includes(value)) {
    return
  }

  updatePackages([...existing, value])
}

function removePackage(name: string) {
  const index = model.value.indexOf(name)
  if (index === -1) {
    return
  }

  model.value.splice(index, 1)
}

function popPackage() {
  model.value.pop()
}

function handleKeydown(event: KeyboardEvent) {
  const input = event.currentTarget as HTMLInputElement

  if (COMMIT_KEYS.includes(event.key)) {
    event.preventDefault()
    if (input.value) {
      addPackage(input.value)
      input.value = ''
    }
  }
  else if (event.key === 'Backspace' && input.value.length === 0) {
    event.preventDefault()

    popPackage()
  }
}

function handlePaste(event: ClipboardEvent) {
  const clipboardData = event.clipboardData
  if (!clipboardData) {
    return
  }

  const pastedData = clipboardData.getData('text')
  const items = parsePackages(pastedData)
  if (items.length === 0) {
    return
  }

  event.preventDefault()

  const existing = sortedPackages.value
  const newItems = items.filter(item => !existing.includes(item))
  if (newItems.length === 0) {
    return
  }

  updatePackages([...existing, ...newItems])
}

const inputRef = shallowRef<HTMLInputElement>()

function getColorStyles() {
  const getColorValue = (token: string, type: string) =>
    ($dt(`message.${token}.${type}`).value as any)?.dark.value

  const styles: Record<string, string> = {}
  const typeSeverity: [string, string][] = [
    ['default', 'info'],
    ['profile', 'warn'],
    ['user', 'success'],
  ]

  for (const [type, severity] of typeSeverity) {
    const bgColor = getColorValue(severity, 'background')
    const color = getColorValue(severity, 'color')

    styles[`--pkg-chip-${type}-bg`] = bgColor
    styles[`--pkg-chip-${type}-color`] = color
  }

  return styles
}

function getChipStyle(chip: PackageChip) {
  const token = chip.type ? chip.type : 'user'

  return {
    'background-color': `var(--pkg-chip-${token}-bg)`,
    'color': `var(--pkg-chip-${token}-color)`,
  }
}
</script>

<template>
  <div
    class="p-textarea p-textarea-sm flex flex-wrap gap-2"
    tabindex="0"
    :style="getColorStyles()"
    @focus="inputRef?.focus()"
  >
    <div
      v-for="item in chipItems"
      :key="item.name"
      class="group px-2 text-center rounded-full flex min-w-8 items-center"
      :style="getChipStyle(item)"
    >
      <span>{{ item.name }}</span>
      <button class="i-carbon:close-outline ml-1 mr--1 cursor-pointer transition-color hover:color-[--p-content-hover-color]" :aria-label="$t('remove')" @click="removePackage(item.name)" />
    </div>
    <input
      ref="inputRef"
      class="outline-none flex-1 min-w-40 w-full"
      :placeholder="$t('inputPackagesHere')"
      @keydown="handleKeydown"
      @paste="handlePaste"
    >
  </div>
</template>

<style scoped>
.p-textarea:hover {
  border-color: var(--p-textarea-hover-border-color);
}

.p-textarea:focus-within {
  border-color: var(--p-textarea-focus-border-color);
  box-shadow: var(--p-textarea-focus-ring-shadow);
  outline: var(--p-textarea-focus-ring-width) var(--p-textarea-focus-ring-style) var(--p-textarea-focus-ring-color);
  outline-offset: var(--p-textarea-focus-ring-offset);
}
</style>
