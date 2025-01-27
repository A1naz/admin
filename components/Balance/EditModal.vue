<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedWithdraw: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:isModalOpen', 'getData'])

const close = () => {
  emit('update:isModalOpen', false)
}
async function changeStatus(status: string) {
  const { data, error } = await useFetch('/api/balanceWithdraw/update', {
    method: 'POST',
    params: {
      id: props.selectedWithdraw._id,
      status,
    },
    watch: false,
  })

  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
  }

  if (data.value) {
    notify({
      type: 'success',
      title: 'Статус изменен',
    })
    emit('getData')
    close()
  }
}
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40 cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="close"
  >
    <div class="modal-box w-9/12 max-w-[500px] cursor-auto" @click.stop>
      <form method="dialog" class="flex justify-between">
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div class="mb-4 w-full text-center">Изменить статус</div>
      <div class="flex gap-2 justify-center">
        <button class="btn btn-primary" @click="changeStatus('created')">
          Активный
        </button>
        <button class="btn btn-warning" @click="changeStatus('work')">
          В работе
        </button>
        <button class="btn btn-info" @click="changeStatus('completed')">
          Завершен
        </button>
        <button class="btn btn-error" @click="changeStatus('canceled')">
          Отменен
        </button>
      </div>
    </div>
  </div>
</template>
