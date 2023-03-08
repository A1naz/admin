<script lang="ts" setup>
const { status, data, signIn, signOut } = useSession()

console.log('status', status.value)
console.log('data', data.value)
definePageMeta({
  layout: "app",
});
</script>

<template>
  <div>
    Page: foo
  </div>
</template>

<style scoped></style>
