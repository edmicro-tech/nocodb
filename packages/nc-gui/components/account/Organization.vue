<script lang="ts" setup>
import { extractSdkResponseErrorMsg, iconMap, useApi, useCopy, useDashboard, useDebounceFn, useNuxtApp } from '#imports'
import type { RequestParams, UserType } from '../../../nocodb-sdk/build/main';

const { api, isLoading } = useApi()

// for loading screen
isLoading.value = true

const { $e } = useNuxtApp()

const { t } = useI18n()

const { user: loggedInUser } = useGlobal()

const organizations = ref([])

const currentPage = ref(1)

const currentLimit = ref(10)
const { $api } = useNuxtApp()

const { $state, $poller } = useNuxtApp()

const baseURL = $api.instance.defaults.baseURL

const isOpen = ref(false)


const baseCreateDlg = ref(false)

const pagination = reactive({
  total: 0,
  pageSize: 10,
  position: ['bottomCenter'],
})

const loadOrganizations = useDebounceFn(async (page = currentPage.value, limit = currentLimit.value) => {
  currentPage.value = page
  const query = {
    limit,
    offset: (page - 1) * limit,
  }
  try {
    await $fetch('/api/v1/organization', {
      baseURL,
      method: 'GET',
      headers: { 'xc-auth': $state.token.value as string },
      query: query
    }).then(res => {
      pagination.total = res.pageInfo.totalRows ?? 0
      pagination.pageSize = 10
      organizations.value = res?.list;
      isLoading.value = false;
    })
  } catch (e: any) {
    message.error(await extractSdkResponseErrorMsg(e))
    isLoading.value = false;
  }
}, 500)

onMounted(() => {
  loadOrganizations()
})


const deleteModalInfo = ref<any | null>(null)

const deleteOrganization = async () => {
  try {
    await $fetch(`/api/v1/organizations/${deleteModalInfo.value?.id}`, {
      baseURL,
      method: 'DELETE',
      headers: { 'xc-auth': $state.token.value as string },
    }).then(async res => {
      message.success(t('msg.success.orgDeleted'))
      await loadOrganizations()
      if (!organizations.value.length && currentPage.value !== 1) {
        currentPage.value--
        loadOrganizations(currentPage.value)
      }
    })
  } catch (e: any) {
    message.error(await extractSdkResponseErrorMsg(e))
  } finally {
    // closing the modal
    isOpen.value = false
    deleteModalInfo.value = null
  }
}

const openCreateOrgModal = () => {
  baseCreateDlg.value = true
}

const openDeleteModal = (organization: any) => {
  deleteModalInfo.value = organization
  isOpen.value = true
}
</script>

<template>
  <div data-testid="nc-super-user-list" class="h-full">
    <div class="max-w-195 mx-auto h-full">
      <div class="text-2xl text-left font-weight-bold mb-4" data-rec="true">{{ $t('title.organizationMgmt') }} </div>
      <div class="py-2 flex gap-4">
        <div class="flex gap-3 items-center ml-auto">
          <component :is="iconMap.reload" class="cursor-pointer" @click="loadOrganizations(currentPage, currentLimit)" />
          <NcButton size="small" type="primary" @click="openCreateOrgModal">
            <div class="flex items-center gap-1" data-rec="true">
              <component :is="iconMap.plus" />
              {{ $t('title.addOrganization') }}
            </div>
          </NcButton>
        </div>
      </div>
      <div class="w-full rounded-md max-w-250 h-[calc(100%-12rem)] rounded-md overflow-hidden mt-5">
        <div class="flex w-full bg-gray-50 border-1 rounded-t-md">
          <div class="py-3.5 text-gray-500 font-medium text-3.5 w-1/3 text-start pl-6" data-rec="true">
            STT
          </div>
          <div class="py-3.5 text-gray-500 font-medium text-3.5 w-2/3 text-start" data-rec="true">{{ $t('labels.name') }}
          </div>
          <div class="flex py-3.5 text-gray-500 font-medium text-3.5 w-28 justify-end mr-4" data-rec="true">
            {{ $t('labels.action') }}
          </div>
        </div>
        <div v-if="isLoading" class="flex items-center justify-center text-center h-[513px]">
          <GeneralLoader size="xlarge" />
        </div>
        <!-- if organizations are empty -->
        <div v-else-if="!organizations.length" class="flex items-center justify-center text-center h-full">
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" :description="$t('labels.noData')" />
        </div>
        <section v-else class="tbody h-[calc(100%-4rem)] nc-scrollbar-md border-t-0 !overflow-auto">
          <div v-for="(el, index) in organizations" :key="el.id" data-testid="nc-token-list"
            class="user flex py-3 justify-around px-1 border-b-1 border-l-1 border-r-1" :class="{
              'py-4': el.roles?.includes('super'),
            }">
            <div class="text-3.5 text-start w-1/3 pl-5 flex items-center ml-2 font-bold">
              <GeneralTruncateText length="29">
                {{ index + 1 }}
              </GeneralTruncateText>
            </div>
            <div class="text-3.5 text-start w-2/3">
              <div class="font-weight-bold" data-rec="true">
                {{ el.name }}
              </div>
            </div>
            <span class="w-26 flex items-center justify-end mr-4">
              <div class="flex items-center gap-2" :class="{
                'opacity-0': el.roles?.includes('super'),
              }">
                <NcDropdown :trigger="['click']">
                  <NcButton size="xsmall" type="ghost">
                    <MdiDotsVertical
                      class="text-gray-600 h-5.5 w-5.5 rounded outline-0 p-0.5 nc-workspace-menu transform transition-transform !text-gray-400 cursor-pointer hover:(!text-gray-500 bg-gray-100)" />
                  </NcButton>

                  <template #overlay>
                    <NcMenu>
                      <template v-if="el.id !== loggedInUser?.id">
                        <NcMenuItem data-rec="true" class="!text-red-500 !hover:bg-red-50" @click="openDeleteModal(el)">
                          <MaterialSymbolsDeleteOutlineRounded />
                          {{ $t('general.remove') }} {{ $t('objects.organization') }}
                        </NcMenuItem>
                      </template>
                    </NcMenu>
                  </template>
                </NcDropdown>
              </div>
            </span>
          </div>

        </section>
      </div>
      <div v-if="pagination.total > 10" class="flex items-center justify-center mt-4">
        <a-pagination v-model:current="currentPage" :total="pagination.total" show-less-items
          @change="loadOrganizations(currentPage, currentLimit)" />
      </div>
      <GeneralDeleteModal v-model:visible="isOpen" entity-name="Organization" :on-delete="() => deleteOrganization()">
        <template #entity-preview>
          <span>
            <div class="flex flex-row items-center py-2.25 px-2.5 bg-gray-50 rounded-lg text-gray-700 mb-4">
              <GeneralIcon icon="users" class="nc-view-icon"></GeneralIcon>
              <div class="text-ellipsis overflow-hidden select-none w-full pl-1.75"
                :style="{ wordBreak: 'keep-all', whiteSpace: 'nowrap', display: 'inline' }">
                {{ deleteModalInfo?.name }}
              </div>
            </div>
          </span>
        </template>
      </GeneralDeleteModal>
      <WorkspaceCreateOrgDlg v-model="baseCreateDlg" />
    </div>
  </div>
</template>

<style scoped>
.user:last-child {
  @apply rounded-b-md;
}
</style>
