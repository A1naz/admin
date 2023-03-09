<script lang="ts" setup>
import { themeChange } from 'theme-change'
import { useMainStore } from '@/stores/main'

const { status, data } = useSession()

const store = useMainStore()
onMounted(async () => {
  themeChange(false)
  console.log(status.value)
  if (status.value === 'authenticated') {
    store.getClient()
  }

})
</script>
<template>
  <div>
    <NuxtLayout>
      <NuxtLoadingIndicator /> <!-- here -->
      <NuxtPage></NuxtPage>
    </NuxtLayout>
  </div>
</template>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.5rem);
}
</style>
