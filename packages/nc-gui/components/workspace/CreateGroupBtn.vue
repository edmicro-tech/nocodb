<script setup lang="ts">
import type { NcButtonSize } from '~/lib'

const props = defineProps<{
  activeWorkspaceId?: string | undefined
  modal?: boolean
  type?: string
  isOpen: boolean
  size?: NcButtonSize
  centered?: boolean
}>()

const { isUIAllowed } = useRoles()

const { orgRoles, workspaceRoles } = useRoles()

const baseStore = useBase()
const { isSharedBase } = storeToRefs(baseStore)

const workspaceStore = useWorkspace()
const { activeWorkspaceId: _activeWorkspaceId } = storeToRefs(workspaceStore)

const groupAddDlg = ref(false)

const size = computed(() => props.size || 'small')
const centered = computed(() => props.centered ?? true)
</script>

<template>
  <NcButton
    v-if="isUIAllowed('groupAdd', { roles: workspaceRoles ?? orgRoles }) && !isSharedBase"
    v-e="['c:group:add']"
    type="text"
    :size="size"
    :centered="centered"
    @click="groupAddDlg = true"
  >
    <slot />
    <WorkspaceCreateGroupDlg v-model="groupAddDlg" />
  </NcButton>
</template>

<style scoped></style>
