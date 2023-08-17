<script lang="ts" setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
    required: true,
  },
})
const closeButton = ref<HTMLElement>()
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
})
</script>

<template>
  <input id="qr-modal" type="checkbox" class="modal-toggle">
  <label v-if="src" for="qr-modal" class="modal">
    <label class="modal-box relative w-80">
      <label ref="closeButton" for="qr-modal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
      <h3 class="text-lg font-bold mb-2">QR-Код для получения</h3>

      <div class="w-full flex flex-col justify-center items-center">
        <img class="rounded-lg" height="250" :alt="code.toString()" width="250" :src="`${src}`">
      </div>

    </label>
  </label>
</template>

<style scoped></style>
