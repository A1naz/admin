<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const { upload, getPublicUrl } = useS3Object()

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedTariff: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(['update:isModalOpen'])

const close = () => {
  emit('update:isModalOpen', false)
}
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40 cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="close"
  >
    <div
      class="modal-box w-9/12 max-w-[500px] cursor-auto"
      @click.stop
    >
      <form method="dialog" class="flex justify-between">
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div class="mt-1 ml-2 text-xl">Контакты</div>
      <div class="mt-1 ml-2">
        Наименование организации
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedTariff.userOrgName"
        />
      </div>
      <div class="mt-1 ml-2">
        ФИО
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedTariff.userFullName"
        />
      </div>
      <div class="mt-1 ml-2">
        Почта
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedTariff.userEmail"
        />
      </div>
      <div class="mt-1 ml-2">
        Номер телефона
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedTariff.userPhone"
        />
      </div>
    </div>
  </div>
</template>
