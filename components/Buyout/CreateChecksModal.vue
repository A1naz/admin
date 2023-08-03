<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },

})
const emit = defineEmits(['close'])
</script>

<template>
  <div />
</template>

<style scoped>

</style>
