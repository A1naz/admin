<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { onMounted } from 'vue'

const url = ref('')
const paymentForm = reactive({
  paymentSum: 1000,
  paymentType: 'transfer' as 'transfer' | 'fast',
})
const closePaymentModal = ref(null) as Ref<HTMLLabelElement | null>
const { notify } = useNotification()
const router = useRouter()
const details = ref(null) as any
const loading = ref(false)
const openedPhoto = ref('')
const infoModal = ref<HTMLDialogElement>()
const currency = useCurrency()
const store = useMainStore()
const transferStatus = ref(null) as Ref<null | string>
const timer = ref(1200)
const alertOpened = ref(true)
const secondsLeft = ref(0)
const paymentID = ref('')
function cancelTransfer() {
  details.value = null
}
function cancelPayment() {
  url.value = ''
  details.value = null
}
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

const { pause, resume, isActive } = useIntervalFn(() => {
  timer.value -= 1
  secondsLeft.value = timer.value - Math.floor(timer.value / 60) * 60
  if (timer.value <= 0) {
    cancelPayment()
    closePaymentModal.value?.click()
    pause()
  }
}, 1000)
pause()
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
    timer.value = 1200
    alertOpened.value = true
    checkPaymentStatus()
    resume()
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
    query: {
      id: paymentID.value,
    },
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
    pause()
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
    openUrl()
  }
}

async function pay() {
  if (paymentForm.paymentSum > 20000 && paymentForm.paymentType === 'transfer') {
    notify({
      title: 'Что-то пошло не так',
      text: 'Сумма для перевода не должна превышать 20000 руб.',
    })
    return
  }
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
  if (data.value && data.value?.status === 'ok') {
    paymentID.value = data.value!.id
    if (data.value.type === 'transfer')
      checkForDetails()
    else if (data.value.type === 'fast')
      checkForLink()
  }
}

function setSum(amount: number) {
  paymentForm.paymentSum = amount
  console.log(paymentForm.paymentSum)
}
function openUrl() {
  window.open(url.value, '_blank', 'noreferrer,noopener')
}

onMounted(() => {
  timer.value = 900
})
</script>

<template>
  <input id="payment-modal" type="checkbox" class="modal-toggle">
  <div class="modal">
    <label class="modal-box">
      <label
        ref="closePaymentModal"
        for="payment-modal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="cancelPayment"
      >✕</label>
      <div class="flex items-center gap-2 mb-2">
        <h3 class="text-xl font-bold ">Пополнить баланс</h3>
        <button class="bg-base-300 p-1 rounded-lg px-2 text-sm" @click="infoModal?.showModal()">
          Как пополнить баланс?
        </button>
      </div>
      <div>
        <div class="w-full flex flex-col gap-2 justify-center items-start" action="">
          <div class="sum w-full">
            <h3 class="text-lg mb-2">Сумма к пополнению</h3>
            <PaymentInput v-model="paymentForm.paymentSum" />
          </div>
          <div class="fastbuttons flex gap-2 w-full">
            <button class="btn btn-sm flex-1" @click="setSum(5000)">5000 ₽</button>
            <button class="btn btn-sm flex-1" @click="setSum(10000)">10 000 ₽</button>
            <button class="btn btn-sm flex-1" @click="setSum(15000)">15 000 ₽</button>
            <button class="btn btn-sm flex-1" @click="setSum(20000)">20 000 ₽</button>
          </div>
          <div class="join join-vertical w-full mt-4">
            <input
              v-model="paymentForm.paymentType"
              disabled
              type="radio"
              name="options"
              value="fast"
              aria-label="Быстро (Временно недоступно)"
              class="btn join-item"
            >
            <input
              v-model="paymentForm.paymentType"
              type="radio"
              name="options"
              value="transfer"
              aria-label="Перевод (без комиссии)"
              class="btn join-item"
            >
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
        <div v-if="!alertOpened" class="details-box">
          <label for="transfer-modal" class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2" @click="cancelTransfer">✕</label>
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-lg">
              Данные для перевода
            </h3>
            <button class="btn btn-sm" @click="infoModal?.showModal()">
              Как пополнить баланс?
            </button>
          </div>

          <div class="flex items-center gap-2 relative">
            <span class="text-primary">
              {{ Math.floor(timer / 60) < 10 ? `0${Math.floor(timer / 60)}` : Math.floor(timer / 60) }}:{{ secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft }}
            </span>
          </div>

          <p class="py-4 text-lg">
            Номер кошелька:
          </p>
          <div class="font-bold text-lg text-center bg-base-200 rounded-lg p-2">
            <div class="tooltip hover:cursor-pointer hover:text-primary" data-tip="Нажмите чтобы скопировать" @click="copyToClipboard(details.transferCard)">
              {{ details.transferCard }}
            </div>
          </div>

          <p class="pt-4 text-lg">
            Сумма пополнения:
          </p>
          <p class="pb-4 text-error">
            СТРОГО КАК УКАЗАНО, С КОПЕЙКАМИ!
          </p>
          <div class="font-bold text-lg text-center bg-base-200 rounded-lg p-2">
            <div class="tooltip hover:cursor-pointer hover:text-primary" data-tip="Нажмите чтобы скопировать" @click="copyToClipboard(details.transferSum.toString())">
              {{ details.transferSum }} ₽
            </div>
          </div>
          <p class="py-4 text-lg">
            Банк для перевода:
          </p>
          <div class="font-bold text-lg text-center bg-base-200 rounded-lg p-2">
            QIWI Кошелек (Киви банк)
          </div>
        </div>
        <div v-if="alertOpened" class="text-sm bg-base-200 p-2 rounded-lg">
          <div class="flex justify-between items-start gap-2 mb-2">
            <span class="font-bold text-red-500 text-lg text-center">
              Внимание!
            </span>
            <button class="btn btn-sm btn-primary mb-2" @click="infoModal?.showModal()">
              Как пополнить баланс?
            </button>
          </div>
          <p class="">
            Пополнение баланса происходит с карты любого банка на указанный номер телефона/кошелька банка QIWI или Киви кошелек (другими словами).
          </p>
          <p class="pt-2">
            При пополнении вводите только те данные, которые мы вам предоставляем.
          </p>
          <p class="pt-2">
            <span class="font-bold text-base">
              А именно, номер кошелька/телефона QIWI и сумму перевода с копейками!
            </span>
          </p>
          <p class="pt-2">
            Для перевода войдите в приложение вашего банка, выберите перевод на QIWI, введите нужную сумму, данные кошелька и нажмите Перевести/Оплатить
          </p>
          <p class="pt-2">
            Максимальная сумма за 1 транзакцию 20 000 рублей.
          </p>
          <p class="pt-2 font-bold text-base">
            Переводы с QIWI на QIWI запрещены. В связи с блокировками кошельков.
          </p>
          <button class="btn btn-block btn-neutral py-2 my-2" @click="alertOpened = false">
            С информацией ознакомился
          </button>
        </div>
      </div>
    </div>
  </div>
  <dialog ref="infoModal" class="modal">
    <form method="dialog" class="modal-box">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
        ✕
      </button>
      <h3 class="text-base font-bold">
        Чтобы пополнить баланс, выполните простые рекомендации:
      </h3>
      <ul class="py-2">
        <li>
          1. Создайте запрос на пополнение
        </li>
        <li>
          2. Перейдите в приложение банка
        </li>
        <li>
          3. Найдите способ пополнения СПБ
        </li>
        <li>
          4. Введите необходимые данные:
        </li>
        <li>
          - номер телефона QIWI кошелька
        </li>
        <li>
          - точную сумму (С КОПЕЙКАМИ!)
        </li>
        <li>
          5. Отправьте сумму нажав кнопку Перевести
        </li>
      </ul>
      <p class="pt-2">
        Пополняйте баланс один раз в 10 минут, не более 20 000 рублей
      </p>
      <div class="images flex gap-2 items-center justify-center mt-2">
        <label for="sbpImageModal" class="cursor-pointer"><nuxt-img class="rounded-lg" src="info/sbp1.jpg" loading="lazy" fit="fill" @click="openedPhoto = 'info/sbp1.jpg'" />
        </label>
        <label for="sbpImageModal" class="cursor-pointer"><nuxt-img class="rounded-lg" src="info/sbp2.jpg" loading="lazy" fit="fill" @click="openedPhoto = 'info/sbp2.jpg'" />
        </label>
        <label for="sbpImageModal" class="cursor-pointer"><nuxt-img class="rounded-lg" src="info/sbp3.jpg" loading="lazy" fit="fill" @click="openedPhoto = 'info/sbp3.jpg'" />
        </label>
      </div>
    </form>
    <input id="sbpImageModal" type="checkbox" class="modal-toggle">

    <label for="sbpImageModal" class="modal cursor-pointer">
      <label for="" class="modal-box max-h-[80vh] p-0 overflow-hidden">
        <label for="sbpImageModal" class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2">✕</label>
        <nuxt-img v-if="openedPhoto" fit="contain" class="object-contain m-auto max-h-[80vh]" :src="openedPhoto || ''" loading="lazy" />
      </label>
    </label>
  </dialog>
</template>

<style scoped></style>
