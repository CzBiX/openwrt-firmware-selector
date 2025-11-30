<script setup lang="ts">
import type { BuildRequest } from '~/utils/asu'
import config from '~/config'

const props = defineProps<{
  defaultPackages: string[]
  profilePackages: string[]
}>()

const uciScript = ref('')
const collapsed = ref(true)
const rootFsSize = ref<number | null>(null)

const {
  data: templateData,
  isFetching: isTemplateFetching,
  execute: loadTemplate,
} = useFetch(import.meta.resolve('/uci-defaults.sh'), {
  immediate: false,
}).text()

async function handleLoadTemplate() {
  if (isTemplateFetching.value) {
    return
  }

  if (!templateData.value) {
    await loadTemplate()
  }
  uciScript.value = templateData.value || ''
}

const packages = ref([
  ...props.defaultPackages,
  ...props.profilePackages,
  ...config.RECOMMENDED_PACKAGES,
])

function handleResetPackages() {
  packages.value = [
    ...props.defaultPackages,
    ...props.profilePackages,
    ...config.RECOMMENDED_PACKAGES,
  ]
}

function handleClearPackages() {
  packages.value = []
}

function handleCopyPackages() {
  const pkgList = packages.value.join('\n')
  navigator.clipboard.writeText(pkgList)
}

const buildRequestParams = computed(() => {
  return {
    packages: packages.value,
    uci_defaults: uciScript.value,
    rootfs_size_mb: rootFsSize.value,
  } as Partial<BuildRequest>
})
</script>

<template>
  <Fieldset v-model:collapsed="collapsed" :legend="$t('customBuild')" toggleable>
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 items-center justify-between">
        <p>{{ $t('includedPackages') }}: {{ packages.length }}</p>
        <div class="flex gap-2">
          <Button
            size="small"
            :label="$t('clear')"
            icon="i-carbon:trash-can"
            severity="warn"
            @click="handleClearPackages"
          />
          <Button
            size="small"
            :label="$t('reset')"
            icon="i-carbon:reset"
            severity="warn"
            @click="handleResetPackages"
          />
          <Button
            size="small"
            :label="$t('copy')"
            icon="i-carbon:copy"
            @click="handleCopyPackages"
          />
        </div>
      </div>
      <EditPackages
        v-model="packages"
        :default-packages="props.defaultPackages"
        :profile-packages="props.profilePackages"
      />
      <div class="flex gap-4 items-center justify-between">
        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        <p>{{ $t('scriptToRunOnFirstBoot') }} (uci-defaults)</p>
        <Button
          size="small"
          :label="$t('loadTemplate')"
          icon="i-carbon:template"
          :loading="isTemplateFetching"
          @click="handleLoadTemplate"
        />
      </div>
      <Textarea
        v-model="uciScript"
        :placeholder="$t('enterYourScriptHere')"
        size="small"
        class="h-40 max-h-80"
      />
      <Panel :header="$t('advancedOptions')" toggleable collapsed>
        <div class="pt-8 flex gap-4">
          <FloatLabel class="self-start">
            <InputNumber
              id="root_fs_size"
              v-model="rootFsSize"
              suffix="MB"
            />
            <label for="root_fs_size">{{ $t('rootFsSize') }}</label>
          </FloatLabel>
          <Message severity="warn" class="flex-1">
            {{ $t('rootFsSizeTips') }}
          </Message>
        </div>
      </Panel>
      <slot
        name="footer"
        :params="buildRequestParams"
      />
    </div>
  </Fieldset>
</template>
