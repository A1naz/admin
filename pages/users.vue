<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Пользователи и права',
})
</script>

<template>
  <div>
    <h1>Пользователи и права</h1>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
