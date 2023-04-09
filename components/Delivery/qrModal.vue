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
</script>

<template>
  <Teleport to="body">
    <input id="qr-modal" type="checkbox" class="modal-toggle">
    <label v-if="src" for="qr-modal" class="modal">
      <label class="modal-box relative w-80">
        <label for="qr-modal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
        <h3 class="text-lg font-bold mb-2">QR-Код для получения</h3>

        <div class="w-full flex flex-col justify-center items-center">
          <img ref="qrCode" class="rounded-lg" height="250" :alt="code.toString()" width="250" :src="`${src}`">
        </div>

      </label>
    </label>
  </Teleport>
</template>

<style scoped></style>
