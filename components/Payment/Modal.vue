<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'

const url = ref('')
const paymentForm = reactive({
  paymentSum: 1000,
  paymentType: 'fast' as 'transfer' | 'fast',
})
const closePaymentModal = ref(null) as Ref<HTMLLabelElement | null>
const { notify } = useNotification()
const router = useRouter()
const details = ref(null) as any
const loading = ref(false)
const currency = useCurrency()
const store = useMainStore()
const transferStatus = ref(null) as Ref<null | string>
function cancelTransfer() {
  details.value = null
}
function cancelPayment() {
  url.value = ''
  details.value = null
}
async function checkForDetails() {
  interface response {
    status: string
    transferCard: string | null
    transferSum: string | number | null
  }
  loading.value = true
  const { data, error, refresh } = await useFetch<response>('/api/payment/getDetails', {
    method: 'GET',
    immediate: true,
  })
  if (error.value) {
    loading.value = false
    notify({
      title: 'Ошибка',
      text: 'Произошла ошибка при получении деталей для оплаты',
      type: 'error',
    })
    return
  }
  if (data.value?.status === 'wait') {
    setTimeout(() => {
      checkForDetails()
    }, 1000)
  }
  if (data.value?.status === 'ok') {
    details.value = { transferCard: data.value.transferCard, transferSum: data.value.transferSum }
    loading.value = false
    checkPaymentStatus()
  }
}
async function checkPaymentStatus() {
  interface response {
    status: string
  }
  if (!details.value && !url.value)
    return
  const { data, error } = await useFetch<response>('/api/payment/checkStatus', {
    method: 'GET',
  })
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
    })
    setTimeout(() => {
      checkPaymentStatus()
    }, 3000)
  }
  if (data.value?.status === 'success') {
    notify({
      type: 'success',
      title: 'Оплата прошла успешно',
    })
    await store.getClient()
    details.value = null
    closePaymentModal.value?.click()
  }
  else {
    setTimeout(() => {
      checkPaymentStatus()
    }, 3000)
  }
}
async function checkForLink() {
  interface response {
    status: string
    url: null | string
  }
  loading.value = true
  const { data, error, refresh } = await useFetch<response>('/api/payment/getLink', {
    method: 'GET',
    immediate: true,
  })
  if (error.value) {
    loading.value = false
    notify({
      title: 'Ошибка',
      text: 'Произошла ошибка при получении ссылки для оплаты',
      type: 'error',
    })
    return
  }
  if (data.value?.status === 'wait') {
    setTimeout(() => {
      checkForLink()
    }, 1000)
  }
  if (data.value?.status === 'ok') {
    url.value = data.value?.url as string
    loading.value = false
    checkPaymentStatus()
    window.open(url.value, '_blank')
  }
}
async function pay() {
  const { data, error } = await useFetch('/api/payment/create', {
    method: 'POST',
    body: {
      amount: paymentForm.paymentSum,
      paymentType: paymentForm.paymentType,
    },
  })
  if (error.value) {
    notify({
      title: 'Ошибка',
      text: 'Произошла ошибка при создании платежа',
      type: 'error',
    })
    return
  }
  if ((data.value as any)?.status === 'ok') {
    if ((data.value as any).type === 'transfer')
      checkForDetails()
    else if ((data.value as any).type === 'fast')
      checkForLink()
  }
}
function openUrl() {
  window.open(url.value, '_blank')
}
</script>

<template>
  <Teleport to="body">
    <input id="payment-modal" type="checkbox" class="modal-toggle">
    <div class="modal">
      <label class="modal-box">
        <label
          ref="closePaymentModal"
          for="payment-modal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="cancelPayment"
        >✕</label>
        <h3 class="text-xl font-bold mb-2">Пополнить баланс</h3>

        <div>
          <div class="w-full flex flex-col gap-6 justify-center items-start" action="">
            <div class="sum w-full">
              <h3 class="text-lg mb-2">Сумма к пополнению</h3>
              <PaymentInput v-model="paymentForm.paymentSum" />
            </div>
            <div class="btn-group btn-group-vertical w-full">
              <button
                class="btn" :class="{
                  'btn-active': paymentForm.paymentType === 'fast',
                }" @click="paymentForm.paymentType = 'fast'"
              >Быстро (3% комиссия)</button>
              <button
                class="btn" :class="{
                  'btn-active': paymentForm.paymentType === 'transfer',
                }" @click="paymentForm.paymentType = 'transfer'"
              >Перевод (без комиссии)</button>
            </div>

          </div>

        </div>
        <div class="modal-action justify-between">
          <label for="payment-modal" class="btn btn-ghost" @click="cancelPayment">Отмена</label>

          <button class="btn btn-primary" @click="pay">Оплатить</button>
        </div>
      </label>
      <div
        v-if="loading"
        class="fixed z-[999999] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden bg-gray-700 bg-opacity-80 flex flex-col items-center justify-center"
      >
        <div class="ease-linear rounded-full mb-4">
          <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white" />
        </div>
        <h2 class="text-center opacity-100 text-white text-xl font-semibold">
          Загрузка...
        </h2>
        <p v-if="paymentForm.paymentType === 'fast'" class="w-1/3 opacity-100 text-white text-center">
          Создается ссылка для оплаты, <br> пожалуйста не
          закрывайте
          эту страницу
        </p>
        <p v-else class="w-1/3 opacity-100 text-white text-center">
          Идет получение данных для перевода, <br> пожалуйста не
          закрывайте
          эту страницу
        </p>
      </div>
    </div>
    <div v-if="url">
      <input id="fastPayment-modal" type="checkbox" class="modal-toggle">
      <div class="modal modal-bottom sm:modal-middle modal-open">
        <div class="modal-box relative">
          <label for="fastPayment-modal" class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2" @click="cancelPayment">✕</label>
          <h3 class="font-bold text-lg">
            Быстрое пополнение
          </h3>
          <p class=" text-sm text-primary animate-pulse">
            Ожидаем платеж...
          </p>
          <p class="py-4">
            Перейдите по ссылке для оплаты. Не закрывайте это окно до завершения платежа.
          </p>
          <button class="btn btn-primary btn-block" @click="openUrl">
            Перейти к оплате
          </button>
        </div>
      </div>
    </div>
    <div v-if="details?.transferCard && details?.transferSum">
      <input id="transfer-modal" type="checkbox" class="modal-toggle">
      <div class="modal modal-bottom sm:modal-middle modal-open">
        <div class="modal-box relative">
          <label for="transfer-modal" class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2" @click="cancelTransfer">✕</label>
          <h3 class="font-bold text-lg">
            Данные для перевода
          </h3>
          <p class=" text-sm text-primary animate-pulse">
            Ожидаем платеж...
          </p>
          <p class="py-4">
            Пожалуйста пополните кошелек Юмани, любым удобным вам способом:
          </p>
          <p class="font-bold text-lg text-center">
            {{ details.transferCard }}
          </p>
          <p class="py-4">
            Сумма для пополнения:
          </p>
          <p class="font-bold text-lg text-center">
            {{ details.transferSum }} ₽
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped></style>
