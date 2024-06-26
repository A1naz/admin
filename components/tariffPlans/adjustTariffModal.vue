<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedUser: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(['update:isModalOpen'])

const postForm = ref({
  mp: '',
  tariff: '',
  type: '',
  timeLimit: 0,
  activationDate: new Date(),
  paymentDate: new Date(),
})

postForm.value.activationDate.setHours(12, 0, 0, 0)
postForm.value.paymentDate.setHours(12, 0, 0, 0)

const close = () => {
  emit('update:isModalOpen', false)
}
const isSaveDisabled = computed(() => {
  return (
    !postForm.value.mp ||
    !postForm.value.tariff ||
    !postForm.value.type ||
    !postForm.value.timeLimit ||
    !postForm.value.activationDate ||
    !postForm.value.paymentDate
  )
})
async function save() {
  if (isSaveDisabled.value) {
    notify({
      title: 'Ошибка',
      text: 'Заполните все поля',
      type: 'error',
    })
    return
  }
  const { data }: any = await useFetch('/api/tariffPlans/save', {
    method: 'POST',
    body: {
      ...postForm.value,
      userUuid: props.selectedUser.uuid,
    },
  })
  if (data.value) {
    notify({
      title: 'Успешно',
      text: 'Пакет добавлен',
      type: 'success',
    })
    postForm.value = {
      mp: '',
      tariff: '',
      type: '',
      timeLimit: 0,
      activationDate: new Date(),
      paymentDate: new Date(),
    }
    close()
  } else {
    notify({
      title: 'Ошибка',
      text: 'Не удалось сохранить пакет',
      type: 'error',
    })
  }
}
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40"
    :class="{ 'modal-open': isModalOpen }"
  >
    <div
      class="modal-box w-9/12 max-w-[500px] min-h-[500px] cursor-auto"
      @click.stop
    >
      <form method="dialog">
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div class="text-xl text-center">Добавление пакета</div>
      <div class="text-center mt-1">{{ selectedUser.username }}</div>
      <div class="px-5 mt-5">
        <select class="select select-bordered w-full" v-model="postForm.mp">
          <option disabled selected value="">Выберите МП</option>
          <option value="wildberries">Wildberries</option>
          <option value="ozon">Ozon</option>
        </select>
        <select
          class="select select-bordered w-full mt-2"
          v-model="postForm.tariff"
        >
          <option disabled selected value="">Выберите тариф</option>
          <option value="launch">Запуск</option>
          <option value="increase">Рост</option>
          <option value="support">Поддержка</option>
        </select>
        <select
          class="select select-bordered w-full mt-2"
          v-model="postForm.type"
        >
          <option disabled selected value="">Выберите услугу</option>
          <option value="basic">Базовый</option>
          <option value="full">Под ключ</option>
        </select>
        <select
          class="select select-bordered w-full mt-2"
          v-model="postForm.timeLimit"
        >
          <option disabled selected :value="0">Выберите срок</option>
          <option :value="1">1 месяц</option>
          <option :value="3">3 месяца</option>
          <option :value="6">6 месяцев</option>
          <option :value="12">12 месяцев</option>
        </select>
        <div class="w-full mt-2 flex">
          <label
            type="text"
            class="input input-bordered w-full flex cursor-pointer"
          >
            <span class="w-full mt-2"> Выберите дату активации </span>

            <div class="-mr-4">
              <DateOnlyPicker
                ref="datePicker"
                :modelValue="postForm.activationDate"
                :min-date="new Date(Date.now() - 1000 * 60 * 60 * 24)"
                :size="'sm'"
                @update:modelValue="postForm.activationDate = $event"
              />
            </div>
          </label>
        </div>
        <div class="w-full mt-2 flex">
          <label
            type="text"
            class="input input-bordered w-full flex cursor-pointer"
          >
            <span class="w-full mt-2"> Выберите дату оплаты </span>

            <div class="-mr-4">
              <DateOnlyPicker
                ref="datePicker"
                :modelValue="postForm.paymentDate"
                :min-date="new Date(Date.now() - 1000 * 60 * 60 * 24)"
                :size="'sm'"
                @update:modelValue="postForm.paymentDate = $event"
              />
            </div>
          </label>
        </div>
      </div>
      <div class="modal-action flex justify-center">
        <button
          class="btn btn-primary text-[16px] w-[300px]"
          @click="save"
          :disabled="isSaveDisabled"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>
