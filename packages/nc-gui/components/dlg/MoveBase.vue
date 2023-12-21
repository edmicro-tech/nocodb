<script setup lang="ts">
import tinycolor from 'tinycolor2'
import type { BaseType } from 'nocodb-sdk'
import { isEeUI, useVModel } from '#imports'

const props = defineProps<{
    visible: boolean
    baseId: string
}>()
const folderId = ref('');
const emit = defineEmits(['update:visible', 'update:component'])

const { refreshCommandPalette } = useCommandPalette()


const { $e } = useNuxtApp()

const dialogShow = useVModel(props, 'visible', emit)
const { $state } = useNuxtApp()
const { $api } = useNuxtApp()

const baseURL = $api.instance.defaults.baseURL
const isLoading = ref(false)
const firstFolderId = ref('')
const listFolder = ref([]);
const listGroupBase = ref([]);
const loadFolder = async () => {
    await $fetch(`/api/v1/groupbase`, {
        baseURL,
        method: 'GET',
        headers: { 'xc-auth': $state.token.value as string },
    }).then(async res => {
        listGroupBase.value = res?.list?.filter(obj => obj.idBase == props.baseId);
        folderId.value = listGroupBase?.value[0]?.idGroup ?? null;
        firstFolderId.value = listGroupBase?.value[0]?.idGroup ?? null;
        await $fetch(`/api/v1/group`, {
            baseURL,
            method: 'GET',
            headers: { 'xc-auth': $state.token.value as string },
        }).then(res => {
            listFolder.value = res?.list;
            console.log(listFolder.value);
        })
    })
}
await loadFolder();

const _move = async () => {
    try {
        console.log(firstFolderId.value);
        if (firstFolderId.value != null) {
            await $fetch(`/api/v1/groupBases/idBase/${props.baseId}`, {
                baseURL,
                method: 'DELETE',
                headers: { 'xc-auth': $state.token.value as string },
            }).then(res => {
                // message.success("Delete Folder Successful");
            })
        }
        if (folderId.value != null) {
            await $fetch(`/api/v1/groupBases`, {
                baseURL,
                method: 'POST',
                headers: { 'xc-auth': $state.token.value as string },
                body: { idGroup: folderId.value, idBase: props.baseId }
            }).then(async res => {
                message.success("Move Base Successfull")
                emit('update:component')
            })
        }
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
        _move()
    }
})

const isEaster = ref(false)
</script>

<template>
    <GeneralModal v-if="baseId" v-model:visible="dialogShow" :closable="!isLoading" :mask-closable="!isLoading"
        :keyboard="!isLoading" class="!w-[30rem]" wrap-class-name="nc-modal-base-duplicate">
        <div>
            <div class="prose-xl font-bold self-center" @dblclick="isEaster = !isEaster">
                {{ $t('general.move') }} {{ $t('objects.project') }}
            </div>

            <div class="mt-4">{{ $t('msg.warning.moveProject') }}</div>

            <!-- <div class="prose-md self-center text-gray-500 mt-4">{{ $t('title.advancedSettings') }}</div> -->

            <a-divider class="!m-0 !p-0 !my-2" />

            <NcSelect v-model:value="folderId" class="w-100 nc-user-roles" :dropdown-match-select-width="false">
                <a-select-option class="nc-users-list-role-option" :value="null" label="Empty">
                    <div data-rec="true">{{ $t('general.empty') }}</div>
                </a-select-option>
                <a-select-option v-for="folder of listFolder" class="nc-users-list-role-option" :value="folder.id"
                    :label="folder.name">
                    <div data-rec="true">{{ folder.name }}</div>
                </a-select-option>
            </NcSelect>
        </div>
        <div class="flex flex-row gap-x-2 mt-2.5 pt-2.5 justify-end">
            <NcButton v-if="!isLoading" key="back" type="secondary" @click="dialogShow = false">{{ $t('general.cancel') }}
            </NcButton>
            <NcButton key="submit" v-e="['a:base:move']" :loading="isLoading" @click="_move">{{ $t('general.confirm')
            }}
            </NcButton>
        </div>
    </GeneralModal>
</template>
