<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
})
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40"
    :class="{ 'modal-open': isModalOpen }"
  >
    <div
      class="modal-box w-9/12 max-w-full min-h-[500px] cursor-auto"
      @click.stop
    >
      <form method="dialog">
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="isModalOpen = false"
        >
          ✕
        </label>
      </form>
    </div>
  </div>
</template>
