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
  const { data, error } = await useFetch(`/api/product/${article.value}`, {
    method: 'GET',
  })
  if ((data.value as any).product) {
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
    <h1 class="text-2xl font-bold mt-1">
      Корзина
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Выберите товар, который будет добавлен в корзину
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
                    'loading': loadingUrl,
                    'btn-disabled': !productData,
                  }"
                  class="btn btn-ghost btn-sm btn-circle bg-base-100" @click="removeProduct"
                >
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
                  <div class="input-sm rounded-lg w-full text-center bg-base-100 ">
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
              }" class="btn btn w-full btn-primary"
              @click="create"
            >
              Добавить
            </button>
          </div>
          <div v-if="productData" class="productinfo mt-4">
            <div class="flex text gap-4 mt-2 items-start">
              <nuxt-img width="48" class="rounded-lg object-contain w-12" :src="productData.image" />
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
      <ClientOnly>
        <DataTable v-if="width > 1024" class="bg-base-200 hidden lg:block" :value="carts">
          <Column field="place" header="№" />
          <Column field="image" header="Фото">
            <template #body="{ data }">
              <nuxt-img class="rounded-lg object-contain h-8" width="32" :src="data.image" />
            </template>
          </Column>
          <Column field="article" header="Артикул">
            <template #body="{ data }">
              <a
                :href="`https://www.wildberries.ru/catalog/${data.article}/detail.aspx`" target="_blank"
                class="text-sm text-secondary link link-hover"
              >
                {{ data.article }}
              </a>
            </template>
          </Column>
          <Column field="amount" header="Кол-во">
            <template #body="{ data }">
              <div>{{ data.amount }}</div>
            </template>
          </Column>
          <Column field="query" header="Ключевой запрос">
            <template #body="{ data }">
              <p class="max-w-xs truncate">
                {{ data.query }}
              </p>
            </template>
          </Column>

          <Column field="status" header="Статус">
            <template #body="{ data }">
              <div
                :class="{
                  'text-warning': data.status === 'created' || data.status === 'work',
                  'text-success': data.status === 'completed',
                }"
              >
                {{ getStatus(data.status) }}
              </div>
            </template>
          </Column>
          <Column field="createdDate" header="Дата создания">
            <template #body="{ data }">
              <div>
                {{ $dayjs(data.createdDate).format('D MMMM HH:mm') }}
              </div>
            </template>
          </Column>
          <Column field="endedDate" header="Дата завершения">
            <template #body="{ data }">
              <div v-if="data.endedDate">
                {{ $dayjs(data.endedDate).format('D MMMM HH:mm') }}
              </div>
              <div v-else>
                Нет
              </div>
            </template>
          </Column>
        </DataTable>
        <div v-else class="cards grid grid-cols-1 gap-4 lg:hidden">
          <div v-for="(item, index) in carts" :key="index" class="card card-compact bg-base-200 border ">
            <div class="card-body">
              <div class="flex gap-4">
                <div class="image">
                  <nuxt-img width="32" class="rounded-lg object-contain" :src="item.image" />
                </div>
                <div class="article flex flex-col gap-0.5">
                  <div class="text-xs">
                    Артикул
                  </div>
                  <a
                    :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`" target="_blank"
                    class="text-secondary link link-hover text-sm"
                  >
                    {{ item.article }}
                  </a>
                </div>
                <div class="status flex flex-col gap-0.5">
                  <div class="text-xs">
                    Статус
                  </div>
                  <div
                    class="text-sm"
                    :class="{
                      'text-warning': item.status === 'created' || item.status === 'work',
                      'text-success': item.status === 'completed',
                    }"
                  >
                    <div>
                      {{ getStatus(item.status) }}
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-0.5">
                  <div class="text-xs">
                    Количество
                  </div>
                  <div class="text-sm">
                    {{ item.amount }}
                  </div>
                </div>
                <div class="date ml-auto text-xs text-end">
                  {{ $dayjs(item.createdDate).format('D MMMM HH:mm') }}
                </div>
              </div>
              <div class="card-actions justify-start mt-2">
                <div>Дата Завершения:</div>
                <div>
                  <div v-if="item.endedDate">
                    {{ $dayjs(item.endedDate).format('D MMMM HH:mm') }}
                  </div>
                  <div v-else>
                    Нет
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
    <div v-else class="hero">
      <div class="hero-content text-center flex justify-center items-center h-80">
        <div class="max-w-md">
          <h1 class="text-3xl font-bold">
            Здесь ничего нет <Icon name="fluent-emoji:thinking-face" />
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
