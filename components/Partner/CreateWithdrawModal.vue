<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close', 'create'])

const currency = useCurrency()

const closeButton = ref<HTMLElement>()
const { $dayjs } = useNuxtApp()
const form = reactive({
  amount: 0,
  card: '',
  fio: '',
})
async function createWithdraw() {
  if (!form.amount || !form.card || !form.fio)
    return

  const { data, error } = await useFetch('/api/partner/createWithdraw', {
    method: 'POST',
    body: form,
  })

  if (error.value)
    notify({ type: 'error', title: 'Что-то пошло не так', text: error.value?.message })

  if (data.value) {
    if (data.value.status === 'ok') {
      notify({ type: 'success', title: 'Вывод успешно создан' })
      emit('create')
    }

    else { notify({ type: 'error', title: 'Что-то пошло не так', text: data.value.message }) }
  }
}
const now = useNow()
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
  emit('close')
})
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle">
  <div
    ref="closeButton" :class="{
      'modal-open': state,
    }"
    class="modal"
  >
    <div class="modal-box">
      <label
        for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="$emit('close')"
      >✕</label>
      <div class="mb-2">
        <h3 class="text-lg font-bold">
          Создание вывода
        </h3>
        <p><span class="font-bold">Внимание!</span> Вывод возможен только на карту <span class="font-bold text-green-500">Сбербанка</span> </p>
        <form class="my-2 flex flex-col gap-2" @submit.prevent="createWithdraw">
          <div>
            <label class="label p-1">
              <span class="label-text">Сумма вывода</span>
            </label>
            <input v-model="form.amount" type="number" placeholder="Сумма" class="input input-bordered w-full">
          </div>
          <div>
            <label class="label p-1">
              <span class="label-text">Номер карты получателя</span>
            </label>
            <input v-model="form.card" type="text" placeholder="220077777777777" class="input input-bordered w-full">
          </div>
          <div>
            <label class="label p-1">
              <span class="label-text">ФИО получателя</span>
            </label>
            <input v-model="form.fio" type="text" placeholder="Пупкин Иван Игоревич" class="input input-bordered w-full">
          </div>
          <button class="btn btn-primary btn-block mt-2">
            Создать
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
