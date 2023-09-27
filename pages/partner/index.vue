<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const route = useRoute()

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

navigateTo('/partner/management')
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Партнерская программа</h1>
    <PartnerDivider />
  </div>
</template>

<style scoped></style>
