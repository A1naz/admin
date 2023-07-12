<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Корзина',
})
const { $dayjs } = useNuxtApp()
const cartForm = reactive({
  amount: 0,
  period: '3h',
  query: '',
  article: '',
  size: 'none',
})
const carts = ref([]) as any
const amount = ref(0)
const now = useNow()
const loadingUrl = ref(false)
const period = ref('3h')
const query = ref('')
const article = ref('')
const size = ref('none')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
async function getCarts() {
  const { data, error } = await useFetch('/api/cart/get', { method: 'GET' })
  if (data.value)
    carts.value = data.value
  if (error.value)
    notify({ type: 'error', title: 'Не удалось получить лайки', text: error.value.message })
}
await getCarts()
async function create() {
  const { data, error } = await useFetch('/api/cart/create', {
    method: 'POST',
    body: {
      amount: amount.value,
      article: article.value,
      query: query.value,
      productData: productData.value,
      size: size.value,
      period: period.value,
    },
  })
  if (error.value)
    return notify({ type: 'error', title: 'Что-то пошло не так', text: error.value.message })
  if (data.value) {
    notify({ type: 'success', title: 'Упешно' })
    removeProduct()
    getCarts()
  }
}
async function getProductInfo() {
  if (!article.value)
    return

  const { data, error } = await useFetch(`/api/product/${article.value}`, {
    method: 'GET',
  })
  if ((data.value as any)?.product) {
    productData.value = (data.value as any).product
    urlError.value = false
  }
  if (error.value)
    urlError.value = true

  loadingUrl.value = false
}
let timeout = null as NodeJS.Timeout | null
async function changeUrl() {
  if (article.value === '')
    return
  loadingUrl.value = true
  if (timeout)
    clearTimeout(timeout)
  timeout = setTimeout(getProductInfo, 2000)
}
function selectPeriod(event: any) {
  period.value = event.target.value
}
function selectSize(event: any) {
  size.value = event.target.value
}
function getStatus(status: string) {
  if (status === 'created')
    return 'Создан'
  else if (status === 'work')
    return 'В работе'
  else if (status === 'completed')
    return 'Завершен'
  else if (status === 'nofunds')
    return 'Недостаточно средств'
  else
    return status
}
function removeProduct() {
  productData.value = null
  article.value = ''
  amount.value = 0
}
onMounted(() => {

})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-4">
      Корзина
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Выберите товар, который будет добавлен в корзину
    </p>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Стоимость одного добавления -  <span class="font-bold">1 руб.</span>
    </p>
    <div class="collapse collapse-plus bg-base-200 rounded-box mb-4 mt-6">
      <input type="checkbox">

      <div class="collapse-title text-xl font-medium">
        Добавить в корзину
      </div>
      <div class="collapse-content">
        <div class=" bg-base-200 rounded-lg">
          <div class="flex items-center gap-6 mb-2 flex-wrap lg:flex-nowrap">
            <div class="relative w-full lg:w-1/3">
              <div>Артикул:</div>
              <div class="input-group w-full mt-2">
                <input
                  v-model="article"
                  :class="{
                    'input-error': urlError,
                    'input-success': productData,
                  }"
                  :disabled="productData"
                  tabindex="0" class="input input-sm w-full" placeholder="12312312" type="text" @input="changeUrl"
                >
                <button
                  :class="{
                    'btn-disabled': !productData,
                  }"
                  class="btn btn-ghost btn-sm btn-circle bg-base-100" @click="removeProduct"
                >
                  <span v-show="loadingUrl" class="loading loading-spinner loading-xs p-2" />

                  <!-- Insert a backspace svg -->
                  <div v-if="!loadingUrl">
                    <IconCSS v-if="productData" class="w-6 h-6" name="fluent:backspace-24-regular" />
                  </div>
                </button>
              </div>
            </div>
            <div class="w-full lg:w-2/3">
              <div>Ключевой запрос:</div>
              <input v-model="query" :disabled="!productData" placeholder="Носки" type="text" class="input input-sm w-full bg-base-100 mt-2">
            </div>
          </div>
          <div class="mt-4 flex gap-6 items-start flex-wrap lg:flex-nowrap">
            <div class="w-full lg:w-1/3">
              <div>Размер:</div>
              <select :disabled="!productData?.sizes.length" class="select select-sm w-full mt-2" @change="selectSize">
                <option v-if="!productData?.sizes.length" value="none">
                  Без размера
                </option>
                <option v-for="(size, index) of productData?.sizes" :key="index" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>
            <div class="w-full grid grid-cols-6 md:grid-cols-12 gap-4 lg:w-2/3">
              <div class="col-span-2 md:col-span-2 w-full">
                <div>Количество:</div>
                <div class="relative flex items-center ml-auto mt-2">
                  <button
                    :disabled="amount <= 0" class="absolute left-0 btn btn-ghost btn-sm btn-square"
                    @click="amount -= 10"
                  >
                    <IconCSS size="16" name="ic:round-minus" />
                  </button>
                  <div
                    :class="{
                      'bg-base-200': !productData,
                    }"
                    class="input-sm rounded-lg w-full text-center bg-base-100"
                  >
                    {{ amount }}
                  </div>
                  <button
                    :disabled="amount >= 1000"
                    :class="{
                      'btn-disabled': !productData,
                    }" class="absolute right-0 btn btn-ghost btn-sm btn-square" @click="amount += 10"
                  >
                    <IconCSS size="16" name="ic:round-plus" />
                  </button>
                </div>
              </div>
              <div class="col-span-4 md:col-span-10">
                <div>Период выполнения:</div>
                <select :disabled="!productData" class="select w-full select-sm mt-2" @change="selectPeriod">
                  <option value="3h">
                    3 часа
                  </option>
                  <option value="12h">
                    12 часов
                  </option>
                  <option value="1day">
                    1 день
                  </option>
                  <option value="3days">
                    3 дня
                  </option>
                  <option value="7days">
                    7 дней
                  </option>
                  <option value="14days">
                    14 дней
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="w-full ml-auto self-start justify-start mt-2 lg:w-40">
            <button
              :class="{
                'btn-disabled': !productData || !query,
              }" class="btn w-full btn-primary"
              @click="create"
            >
              Добавить
            </button>
          </div>
          <div v-if="productData" class="productinfo mt-4">
            <div class="flex text gap-4 mt-2 items-start">
              <nuxt-img width="48" class="rounded-lg object-contain w-12" loading="lazy" :src="productData.image" />
              <div class="article">
                <a
                  :href="`https://www.wildberries.ru/catalog/${productData.article}/detail.aspx`" target="_blank"
                  class="text-secondary link link-hover"
                >
                  {{ productData.article }}
                </a>
              </div>
              <div class="name truncate">
                {{ productData.name }}
              </div>
              <div class="price">
                {{ productData.priceText }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="carts.length">
      <div v-if="width > 1024">
        <CartTable :get-status="getStatus" :carts="carts" />
      </div>
      <div v-else>
        <CartCards :carts="carts" :get-status="getStatus" />
      </div>
    </div>
    <div v-else>
      <Hero />
    </div>
  </div>
</template>

<style scoped></style>
