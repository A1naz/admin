<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const route = useRoute()
const partnerStore = usePartnerStore()
const { signOut } = useAuth()
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})
if (partnerStore.quantity) {
  navigateTo('/partner/withdrawsRequires')
} else {
  navigateTo('/partner/withdraws')
}

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('управление партнеркой')
) {
  // await signOut({
  //   callbackUrl: '/auth',
  // })
  // navigateTo('/auth')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Партнерская программа</h1>
    <PartnerDivider />
  </div>
</template>

<style scoped></style>
