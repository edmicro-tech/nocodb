<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form'
import type { Form, Input } from 'ant-design-vue'
import type { VNodeRef } from '@vue/runtime-core'
import { computed } from '@vue/reactivity'
import { baseTitleValidator, extractSdkResponseErrorMsg, ref, useI18n, useVModel } from '#imports'
const { $state } = useNuxtApp()
const { $api } = useNuxtApp()
const baseURL = $api.instance.defaults.baseURL

const props = defineProps<{
    visible: boolean
    folder: any
}>()

const emit = defineEmits(['update:visible', 'update:component'])

const { t } = useI18n()

const dialogShow = useVModel(props, 'visible', emit)


const basesStore = useBases()

const nameValidationRules = [
    {
        required: true,
        message: t('msg.info.folderNameRequired'),
    },
    baseTitleValidator,
] as RuleObject[]

const form = ref<typeof Form>()

const formState = ref({
    title: '',
})

const creating = ref(false)

const createGroup = async () => {
    creating.value = true
    try {
        const base = await $fetch(`/api/v1/groups/childGroup`, {
            baseURL,
            method: 'POST',
            body: {
                name: formState.value.title,
                idParent: props.folder?.id
            },
            headers: { 'xc-auth': $state.token.value as string },
        })
    } catch (e: any) {
        message.error(await extractSdkResponseErrorMsg(e))
    } finally {
        emit('update:component')
        creating.value = false
        dialogShow.value = false
        message.success("Create Child Folder Successful")
    }
}

const input: VNodeRef = ref<typeof Input>()

watch(dialogShow, async (n, o) => {
    if (n === o && !n) return

    // Clear errors
    setTimeout(async () => {
        form.value?.resetFields()

        formState.value = {
            title: 'Folder',
        }

        await nextTick()

        input.value?.$el?.focus()
        input.value?.$el?.select()
    }, 5)
})

const typeLabel = 'Folder'
</script>

<template>
    <NcModal v-model:visible="dialogShow" size="small">
        <template #header>
            <!-- Create A New Table -->
            <div class="flex flex-row items-center">
                <GeneralFolderIcon class="mr-2.5 !text-lg !h-4" />
                {{
                    $t('general.createEntity', {
                        entity: typeLabel,
                    })
                }} ({{ folder?.name }})
            </div>
        </template>
        <div class="mt-3">
            <a-form ref="form" :model="formState" name="basic" layout="vertical" class="w-full !mx-auto" no-style
                autocomplete="off" @finish="createGroup">
                <a-form-item name="title" :rules="nameValidationRules" class="m-10">
                    <a-input ref="input" v-model:value="formState.title" name="title"
                        class="nc-metadb-base-name nc-input-md" placeholder="Title" />
                </a-form-item>
            </a-form>

            <div class="flex flex-row justify-end mt-7 gap-x-2">
                <NcButton type="secondary" @click="dialogShow = false">{{ $t('general.cancel') }}</NcButton>
                <NcButton v-e="['a:group:add']" data-testid="docs-create-proj-dlg-create-btn" :loading="creating"
                    type="primary" :label="`${$t('general.create')} ${typeLabel}`"
                    :loading-label="`${$t('general.creating')} ${typeLabel}`" @click="createGroup">
                    {{
                        $t('general.createEntity', {
                            entity: typeLabel,
                        })
                    }}
                    <template #loading>
                        {{
                            $t('general.creatingEntity', {
                                entity: typeLabel,
                            })
                        }}
                    </template>
                </NcButton>
            </div>
        </div>
    </NcModal>
</template>

<style scoped lang="scss">
:deep(.ant-modal-content) {
    @apply !p-0;
}
</style>
