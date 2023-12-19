<script setup lang="ts">
import type { TableType } from 'nocodb-sdk'

import ProjectWrapper from './ProjectWrapper.vue'

import {
  TreeViewInj,
  computed,
  isDrawerOrModalExist,
  isElementInvisible,
  isMac,
  reactive,
  ref,
  resolveComponent,
  storeToRefs,
  useBase,
  useBases,
  useDialog,
  useNuxtApp,
  useRoles,
  useRouter,
  useTablesStore,
} from '#imports'

const { isUIAllowed } = useRoles()

const { $e } = useNuxtApp()

const router = useRouter()

const route = router.currentRoute

const basesStore = useBases()

const { createProject: _createProject } = basesStore

const { bases, basesList, activeProjectId } = storeToRefs(basesStore)

const { isWorkspaceLoading } = storeToRefs(useWorkspace())

const isOpenModalDelete = ref(false)

const baseCreateDlg = ref(false)

const isShow = ref(false)

const baseStore = useBase()
const { $state, $poller } = useNuxtApp()
const { $api } = useNuxtApp()

const baseURL = $api.instance.defaults.baseURL
const { isSharedBase } = storeToRefs(baseStore)

const { activeTable: _activeTable } = storeToRefs(useTablesStore())

const contextMenuTarget = reactive<{ type?: 'base' | 'source' | 'table' | 'main' | 'layout'; value?: any }>({})

const setMenuContext = (type: 'base' | 'source' | 'table' | 'main' | 'layout', value?: any) => {
  contextMenuTarget.type = type
  contextMenuTarget.value = value
}
const openFolders = ref<any[]>([]);
const listFolder = ref<any[]>([]);
const listGroupBase = ref<any[]>([]);
const deleteModalInfo = ref<any>(null)
const isMoveBaseVisible = ref(false)
const folderSelected = ref<any>(null)
const loadFolder = async () => {
  await $fetch(`/api/v1/groupbase`, {
    baseURL,
    method: 'GET',
    headers: { 'xc-auth': $state.token.value as string },
  }).then(async res => {
    listGroupBase.value = res?.list;
    await $fetch(`/api/v1/group`, {
      baseURL,
      method: 'GET',
      headers: { 'xc-auth': $state.token.value as string },
    }).then(res => {
      listFolder.value = res?.list;
      listFolder.value = listFolder.value.map(obj => ({ ...obj, listBaseInFolder: listGroupBase.value.filter(x => x.idGroup === obj.id).map(x => x.idBase) }));
      console.log(listFolder.value);
    })
  })
}
await loadFolder();
const updateFolderName = async (folder: any) => {
  folderSelected.value = folder;
  isMoveBaseVisible.value = true;
}
function openRenameTableDialog(table: TableType, _ = false) {
  if (!table || !table.source_id) return

  $e('c:table:rename')

  const isOpen = ref(true)

  const { close } = useDialog(resolveComponent('DlgTableRename'), {
    'modelValue': isOpen,
    'tableMeta': table,
    'sourceId': table.source_id, // || sources.value[0].id,
    'onUpdate:modelValue': closeDialog,
  })

  function closeDialog() {
    isOpen.value = false

    close(1000)
  }
}

function openTableCreateDialog(sourceId?: string, baseId?: string) {
  if (!sourceId && !(baseId || basesList.value[0].id)) return

  $e('c:table:create:navdraw')

  const isOpen = ref(true)

  const { close } = useDialog(resolveComponent('DlgTableCreate'), {
    'modelValue': isOpen,
    'sourceId': sourceId, // || sources.value[0].id,
    'baseId': baseId || basesList.value[0].id,
    'onUpdate:modelValue': closeDialog,
  })

  function closeDialog() {
    isOpen.value = false

    close(1000)
  }
}

const duplicateTable = async (table: TableType) => {
  if (!table || !table.id || !table.base_id) return

  const isOpen = ref(true)

  $e('c:table:duplicate')

  const { close } = useDialog(resolveComponent('DlgTableDuplicate'), {
    'modelValue': isOpen,
    'table': table,
    'onUpdate:modelValue': closeDialog,
  })

  function closeDialog() {
    isOpen.value = false

    close(1000)
  }
}

const isCreateTableAllowed = computed(
  () =>
    isUIAllowed('tableCreate') &&
    route.value.name !== 'index' &&
    route.value.name !== 'index-index' &&
    route.value.name !== 'index-index-create' &&
    route.value.name !== 'index-index-create-external' &&
    route.value.name !== 'index-user-index',
)

useEventListener(document, 'keydown', async (e: KeyboardEvent) => {
  const cmdOrCtrl = isMac() ? e.metaKey : e.ctrlKey
  if (e.altKey && !e.shiftKey && !cmdOrCtrl) {
    switch (e.keyCode) {
      case 84: {
        // ALT + T
        if (isCreateTableAllowed.value && !isDrawerOrModalExist()) {
          // prevent the key `T` is inputted to table title input
          e.preventDefault()
          $e('c:shortcut', { key: 'ALT + T' })
          const baseId = activeProjectId.value
          const base = baseId ? bases.value.get(baseId) : undefined
          if (!base) return

          if (baseId) openTableCreateDialog(base.sources?.[0].id, baseId)
        }
        break
      }
      // ALT + L - only show active base
      case 76: {
        if (route.value.params.baseId) {
          router.push({
            query: {
              ...route.value.query,
              clear: route.value.query.clear === '1' ? undefined : '1',
            },
          })
        }
        break
      }
      // ALT + D
      case 68: {
        e.stopPropagation()
        baseCreateDlg.value = true
        break
      }
    }
  }
})
function toggleDropdown(id: string) {
  const index = openFolders.value.indexOf(id);
  if (index === -1) {
    openFolders.value.push(id);
  } else {
    openFolders.value.splice(index, 1);
  }
};
function openDeleteFolder(folder: any) {
  deleteModalInfo.value = folder;
  isOpenModalDelete.value = true;
}
const deleteFolder = async () => {
  try {
    await $fetch(`/api/v1/groups/${deleteModalInfo?.value?.id}`, {
      baseURL,
      method: 'DELETE',
      headers: { 'xc-auth': $state.token.value as string },
    }).then(res => {
      message.success("Delete Folder Successful");
      loadFolder()
    })
  } catch (e: any) {
    message.error(await extractSdkResponseErrorMsg(e))
  } finally {
    // closing the modal
    isOpenModalDelete.value = false
    deleteModalInfo.value = null
  }
}
const handleContext = (e: MouseEvent) => {
  if (!document.querySelector('.source-context, .table-context')?.contains(e.target as Node)) {
    setMenuContext('main')
  }
}

provide(TreeViewInj, {
  setMenuContext,
  duplicateTable,
  openRenameTableDialog,
  contextMenuTarget,
})

useEventListener(document, 'contextmenu', handleContext, true)

const scrollTableNode = () => {
  const activeTableDom = document.querySelector(`.nc-treeview [data-table-id="${_activeTable.value?.id}"]`)
  if (!activeTableDom) return

  // Scroll to the table node
  activeTableDom?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

watch(
  () => _activeTable.value?.id,
  () => {
    if (!_activeTable.value?.id) return

    // TODO: Find a better way to scroll to the table node
    setTimeout(() => {
      scrollTableNode()
    }, 1000)
  },
  {
    immediate: true,
  },
)

watch(
  activeProjectId,
  () => {
    const activeProjectDom = document.querySelector(`.nc-treeview [data-base-id="${activeProjectId.value}"]`)
    if (!activeProjectDom) return

    if (isElementInvisible(activeProjectDom)) {
      // Scroll to the table node
      activeProjectDom?.scrollIntoView({ behavior: 'smooth' })
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="nc-treeview-container flex flex-col justify-between select-none">
    <div v-if="!isSharedBase" class="text-gray-500 font-medium pl-3.5 mb-1">{{ $t('objects.projects') }}</div>
    <div mode="inline" class="nc-treeview pb-0.5 flex-grow min-h-50 overflow-x-hidden">
      <div v-if="listFolder?.length" v-for="folder of listFolder">
        <div class="flex flex-row items-center mt-2">
          <NcButton v-e="['c:base:expand']" type="text" size="xxsmall" class="ml-4" @click="toggleDropdown(folder.id)">
            <GeneralFolderIcon :isShow="openFolders?.includes(folder.id)" />
            <strong class="text-gray-700 ml-2 font-medium">{{ folder.name }}</strong>
          </NcButton>
          <div class="ml-auto">
            <NcButton @click="openDeleteFolder(folder)" class="mr-1" type="text" size="xxsmall">
              <GeneralIcon icon="plus" class="text-sm text-gray-500 focus:outline-none" />
            </NcButton>
            <NcButton @click="updateFolderName(folder)" class="mr-1" type="text" size="xxsmall">
              <GeneralIcon icon="edit" class="text-sm text-gray-500 focus:outline-none" />
            </NcButton>
            <NcButton @click="openDeleteFolder(folder)" class="mr-1" type="text" size="xxsmall">
              <GeneralIcon icon="delete" class="text-sm text-red-500 focus:outline-none" />
            </NcButton>
          </div>
          <GeneralDeleteModal v-model:visible="isOpenModalDelete" entity-name="Folder" :on-delete="() => deleteFolder()">
          </GeneralDeleteModal>
        </div>
        <div
          v-if="basesList.filter(x => folder.listBaseInFolder?.includes(x.id))?.length === 0 && openFolders?.includes(folder.id)"
          class="py-0.5 text-gray-500 ml-13.55">
          {{ $t('general.empty') }}
        </div>
        <div v-show="openFolders?.includes(folder.id)" class="ml-3">
          <template v-if="folder.listBaseInFolder?.length">
            <ProjectWrapper v-for="base of basesList.filter(x => folder.listBaseInFolder?.includes(x.id))" :key="base.id"
              :base-role="base.project_role" :base="base">
              <DashboardTreeViewProjectNode />
            </ProjectWrapper>
          </template>
        </div>
      </div>
      <template v-if="basesList?.length - listGroupBase?.length > 0">
        <ProjectWrapper v-for="base of basesList.filter(x => !listGroupBase.map(obj => obj.idBase)?.includes(x.id))"
          :key="base.id" :base-role="base.project_role" :base="base">
          <DashboardTreeViewProjectNode />
        </ProjectWrapper>
      </template>
      <!-- <WorkspaceEmptyPlaceholder v-else-if="!isWorkspaceLoading" /> -->
    </div>
    <WorkspaceCreateProjectDlg v-model="baseCreateDlg" />
    <WorkspaceEditFolderDlg v-if="isMoveBaseVisible" v-model:visible="isMoveBaseVisible" :folder="folderSelected" />
  </div>
</template>

<style scoped lang="scss"></style>