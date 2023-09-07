<script setup lang="ts">
const emit = defineEmits(['openModal'])
</script>

<template>
  <div class="flex items-center gap-1">
    <button class="btn btn-xs btn-primary" @click="emit('openModal')">
      <IconCSS size="18" class="h-8 w-8" name="uil:youtube" />
      Видеообучение
    </button>
    <a target="_blank" href="https://docs.google.com/document/d/1VVEjeQJwh1FeTolOudA_EoX5uRTzL3zi-Mi2uuZBono/edit?usp=sharing" class="btn btn-xs btn-primary">
      FAQ
    </a>
  </div>
</template>

<style scoped>

</style>
