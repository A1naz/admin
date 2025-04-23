<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props = defineProps({
  state: { type: Boolean, required: false, default: false },
  selectedNotification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:state'])

async function saveNotification() {
  const { data, error } = await useFetch('/api/notifications/update', {
    method: 'POST',
    body: props.selectedNotification,
    watch: false,
  })
  if (error.value) {
    notify({
      title: 'Ошибка',
      text: error.value.message,
      type: 'error',
    })
  } else {
    notify({
      title: 'Успех',
      text: 'Уведомление успешно сохранено',
      type: 'success',
    })
    emit('update:state', false)
  }
}
</script>

<template>
  <div
    :class="{ 'modal-open': state }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div class="modal-box cursor-auto max-w-[800px]" @click.stop>
      <div class="flex flex-col w-full gap-3">
        <input
          type="text"
          class="input input-bordered w-full"
          placeholder="Название"
          v-model="selectedNotification.category"
        />
        <textarea 
          type="text"
          class="textarea textarea-bordered w-full"
          placeholder="Описание"
          v-model="selectedNotification.text"
        />
        <div class="flex justify-start w-[102px]">
          <DatePicker
            ref="datePicker"
            :modelValue="selectedNotification.activationDate"
            :min-date="new Date(Date.now() - 1000 * 60 * 60 * 24)"
            size="sm"
            @update:modelValue="selectedNotification.activationDate = $event"
          />
        </div>
      </div>
      <div class="modal-action">
  
        <button class="btn" @click="$emit('update:state', false)">
          Отмена
        </button>
        <button
          class="btn btn-primary"
          @click="saveNotification"
          :disabled="
            !selectedNotification.category || !selectedNotification.text
          "
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
