<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form'
import { isEeUI, useVModel } from '#imports'
import type { Form, Input } from 'ant-design-vue'
import type { VNodeRef } from '@vue/runtime-core'
const props = defineProps<{
    visible: boolean
    folder: any
}>()
const folderId = ref('');
const emit = defineEmits(['update:visible', 'update:component'])
// const emitComponent = defineEmits([])
const { $e } = useNuxtApp()
const dialogShow = useVModel(props, 'visible', emit)
const { $state } = useNuxtApp()
const { $api } = useNuxtApp()

const form = ref<typeof Form>()

const formState = ref({
    title: props.folder?.name,
})

const { t } = useI18n()

const baseURL = $api.instance.defaults.baseURL

const isLoading = ref(false)

const nameValidationRules = [
    {
        required: true,
        message: t('msg.info.folderNameRequired'),
    },
    baseTitleValidator,
] as RuleObject[]

const input: VNodeRef = ref<typeof Input>()

watch(dialogShow, async (n, o) => {
    if (n === o && !n) return

    // Clear errors
    setTimeout(async () => {
        form.value?.resetFields()

        formState.value = {
            title: props.folder?.name,
        }

        await nextTick()

        input.value?.$el?.focus()
        input.value?.$el?.select()
    }, 5)
})
const _update = async () => {
    try {
        let body = { name: formState.value.title }
        await $fetch(`/api/v1/groups/${props.folder?.id}`, {
            baseURL,
            method: 'PATCH',
            body: body,
            headers: { 'xc-auth': $state.token.value as string },
        }).then(res => {
            message.success("Edit Folder Name Successful")
            emit('update:component')

        })
    } catch (e: any) {
        message.error(await extractSdkResponseErrorMsg(e))
    } finally {
        isLoading.value = false
        dialogShow.value = false
    }

}

onKeyStroke('Enter', () => {
    // should only trigger this when our modal is open
    if (dialogShow.value) {
        // _duplicate()
        _update()
    }
})

const isEaster = ref(false)
</script>

<template>
    <GeneralModal v-if="folder.id" v-model:visible="dialogShow" :closable="!isLoading" :mask-closable="!isLoading"
        :keyboard="!isLoading" class="!w-[30rem]" wrap-class-name="nc-modal-base-duplicate">
        <div>
            <div class="prose-xl font-bold self-center" @dblclick="isEaster = !isEaster">
                {{ $t('general.edit') }} {{ $t('labels.folder') }}
            </div>
            <a-divider class="!m-0 !p-0 !my-3" />

            <a-form ref="form" :model="formState" name="basic" layout="vertical" class="w-full !mx-auto" no-style
                autocomplete="off" @finish="_update">
                <a-form-item name="title" :rules="nameValidationRules" class="m-10">
                    <a-input ref="input" v-model:value="formState.title" name="title"
                        class="nc-metadb-base-name nc-input-md" placeholder="Title" />
                </a-form-item>
            </a-form>
        </div>
        <div class="flex flex-row gap-x-2 justify-end">
            <NcButton v-if="!isLoading" key="back" type="secondary" @click="dialogShow = false">{{ $t('general.cancel') }}
            </NcButton>
            <NcButton key="submit" v-e="['a:folder:update']" :loading="isLoading" @click="_update">{{ $t('general.confirm')
            }}
            </NcButton>
        </div>
    </GeneralModal>
</template>
