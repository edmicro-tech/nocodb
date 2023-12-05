<script lang="ts" setup>
</script>

<template>
  <!-- <a
    v-e="['c:navbar:join-cloud']"
    class="flex !no-underline"
    href="https://app.nocodb.com/#/signin?utm_source=OSS&utm_medium=OSS&utm_campaign=OSS&utm_content=OSS"
  >
    <component :is="iconMap.cloud" class="mr-1" />
    Join NocoDB Cloud
  </a> -->
</template>

<style lang="scss">
.nc-join-cloud-tooltip {
  .ant-tooltip-inner {
    @apply !bg-transparent !p-0 !text-gray-700 rounded-3xl;
  }
  .ant-tooltip-arrow-content {
    @apply !bg-white;
  }
}
</style>
