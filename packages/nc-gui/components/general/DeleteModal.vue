<script lang="ts" setup>
import { onKeyStroke } from '#imports'
const confirmationInput = ref('');
const confirmationError = ref(false);
const props = defineProps<{
  visible: boolean
  entityName: string
  onDelete: () => Promise<void>
  deleteLabel?: string | undefined
}>()

const emits = defineEmits(['update:visible'])
const visible = useVModel(props, 'visible', emits)

const isLoading = ref(false)

const { t } = useI18n()

const deleteLabel = computed(() => props.deleteLabel ?? t('general.delete'))

const onDelete = async () => {
  if (confirmationInput.value.toLowerCase() !== 'confirm') {
    confirmationError.value = true;
    return;
  }
  isLoading.value = true
  try {
    await props.onDelete()
    visableForm();
  } catch (e: any) {
    console.error(e)
    message.error(await extractSdkResponseErrorMsg(e))
  } finally {
    isLoading.value = false
  }
}
const visableForm = () => {
  visible.value = false;
  confirmationInput.value = '';
  confirmationError.value = false;
}

onKeyStroke('Escape', () => {
  if (visible.value) visible.value = false
})

onKeyStroke('Enter', () => {
  if (isLoading.value) return

  if (!visible.value) return

  onDelete()
})
</script>

<template>
  <GeneralModal v-model:visible="visible" size="small" centered>
    <div class="flex flex-col p-6">
      <div class="flex flex-row pb-2 mb-4 font-medium text-lg border-b-1 border-gray-50 text-gray-800">
        {{ deleteLabel }} {{ props.entityName }}
      </div>

      <div class="mb-3 text-gray-800">
        {{
          $t('msg.areYouSureUWantToDeleteLabel', {
            deleteLabel: deleteLabel.toLowerCase(),
          })
        }}<span class="ml-1">{{ props.entityName.toLowerCase() }}?</span>
      </div>

      <slot name="entity-preview"></slot>

      <!-- Add a text input for confirmation -->
      <div class="mb-3">
        <label for="confirmationInput" class="text-gray-800">Please fill <span
            class="text-red-600 font-bold">'confirm'</span> to delete</label>
        <input type="text" id="confirmationInput" v-model="confirmationInput"
          class="border font-medium focus:outline-none focus:border-indigo-500/100 rounded p-1 w-100 text-red-500 mt-2 mb-2" />
        <!-- Show an error message if confirmation is incorrect -->
        <div v-if="confirmationError" class="text-red-500">{{ $t('general.confirmationError') }}</div>
      </div>

      <div class="flex flex-row gap-x-2 mt-2.5 pt-2.5 justify-end">
        <NcButton type="secondary" @click="visableForm">
          {{ $t('general.cancel') }}
        </NcButton>

        <NcButton key="submit" type="danger" html-type="submit" :loading="isLoading"
          data-testid="nc-delete-modal-delete-btn" @click="onDelete">
          {{ `${deleteLabel} ${props.entityName}` }}
          <template #loading>
            {{ $t('general.deleting') }}
          </template>
        </NcButton>
      </div>
    </div>
  </GeneralModal>
</template>

<style lang="scss">
.nc-modal-wrapper {
  .ant-modal-content {
    @apply !p-0;
  }
}
</style>
