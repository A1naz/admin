<script setup lang="ts">
const emit = defineEmits(['openModal'])
const store = useMainStore()
</script>

<template>
  <div class="flex items-center gap-1">
    <button class="btn btn-xs btn-primary" @click="emit('openModal')">
      <IconCSS size="18" class="h-8 w-8" name="uil:youtube" />
      Видеообучение
    </button>
    <button class="btn btn-xs btn-primary" @click="store.faqModal = true">
      FAQ
    </button>
  </div>
</template>

<style scoped>

</style>
