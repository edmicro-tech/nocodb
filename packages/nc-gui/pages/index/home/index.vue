<script lang="ts" setup>
definePageMeta({
  hideHeader: true,
  hasSidebar: true,
})
const basesStore = useBases()
const { $state, $poller } = useNuxtApp()
const { basesList } = storeToRefs(basesStore)
const { $api } = useNuxtApp()

const baseURL = $api.instance.defaults.baseURL
import { ref } from 'vue'

const numberOfEmptyBases = basesList.value.filter(x => x.sources?.length ?? 0 == 0).length;
const numberOfTables = ref<number>(0);
const numberOfBaseHaveTable = ref<number>(0);
const numberTableEmpty = ref<number>(0);
const listAudit = ref();


const countTables = await $fetch(`/api/v2/meta/bases/tables/count`, {
  baseURL,
  method: 'GET',
  headers: { 'xc-auth': $state.token.value as string },
}).then(res => {
  numberOfTables.value = res?.numberOfTable;
  numberOfBaseHaveTable.value = res?.numberOfBaseHaveTable;
  numberTableEmpty.value = res?.numberTableEmpty;
})


await $fetch(`/api/v2/meta/audits/all`, {
  baseURL,
  method: 'GET',
  headers: { 'xc-auth': $state.token.value as string },
}).then(res => {
  listAudit.value = res?.list;
  console.log(listAudit);
})

</script>

<template>
  <div class="mx-auto max-w-10xl px-6 lg:px-8 overflow-auto">
    <div class="max-w-10xl mx-auto px-4 sm:px-6 sm:py-12 lg:px-8">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thống kê cơ sở dữ liệu</h2>
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-3 md:grid-cols-2 mt-4">
        <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Tổng số CSDL</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">{{ basesList?.length }}</dd>
            </dl>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Số lượng CSDL có dữ liệu</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">{{ numberOfBaseHaveTable
              }}</dd>
            </dl>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Số lượng CSDL trống</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">{{ basesList?.length -
                numberOfBaseHaveTable }}</dd>
            </dl>
          </div>
        </div>
        <!-- <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Cơ sở dữ liệu truy cập nhiều nhất</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">166.7K</dd>
            </dl>
          </div>
        </div> -->
      </div>
    </div>
    <div class="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thống kê bảng dữ liệu</h2>
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-3 md:grid-cols-2 mt-4">
        <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Tổng số bảng dữ liệu</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">{{ numberOfTables }}</dd>
            </dl>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Số lượng bảng có dữ liệu</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">{{ numberOfTables - numberTableEmpty }}
              </dd>
            </dl>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Số lượng bảng trống</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">{{ numberTableEmpty }}</dd>
            </dl>
          </div>
        </div>
        <!-- <div class="bg-white overflow-hidden shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm leading-5 font-medium text-gray-500 truncate">Bảng dữ liệu truy cập nhiều nhất</dt>
              <dd class="mt-1 text-3xl leading-9 font-semibold text-indigo-600">166.7K</dd>
            </dl>
          </div>
        </div> -->
      </div>
    </div>
    <div class="max-w-10xl mx-auto px-4 sm:px-6 sm:py-8 lg:px-8">
      <!-- Stacked list -->
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">Danh sách hoạt động gần đây</h2>
      <ul role="list" class="mt-5 divide-y divide-gray-200 border-t border-gray-200 sm:mt-0 sm:border-t-0">
        <li v-for="element of listAudit">
          <div class="group block">
            <div class="flex items-center py-5 px-4 sm:py-6 sm:px-0">
              <div class="flex min-w-0 flex-1 items-center">
                <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                  <div>
                    <p class="truncate not-underline text-sm font-medium text-purple-600">{{ element.title }}</p>
                    <p class="mt-2 flex items-center text-sm text-gray-500">
                      <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" x-description="Heroicon name: mini/envelope"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z">
                        </path>
                        <path
                          d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z">
                        </path>
                      </svg>
                      <span class="truncate not-underline">{{ element.user }}</span>
                    </p>
                  </div>
                  <div class="hidden md:block">
                    <div>
                      <p class="text-sm not-underline text-gray-900">
                        <time datetime="2020-07-01T15:34:56">{{ element?.created_at }}</time>
                      </p>
                      <p class="mt-2 flex not-underline items-center text-sm text-gray-500">
                        {{ element.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <!-- <svg class="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                  x-description="Heroicon name: mini/chevron-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                  fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd"></path>
                </svg> -->
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.not-underline{
  text-decoration-line: none !important;
}
</style>