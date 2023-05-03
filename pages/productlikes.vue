<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на товар/бренд',
})
const { $dayjs } = useNuxtApp()
const product_likes = ref([]) as any
const amount = ref(0)
const loadingUrl = ref(false)
const url = ref('')
const period = ref('3h')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
async function getProductLikes() {
  const { data, error } = await useFetch('/api/productlikes/get', { method: 'GET' })
  if (data.value)
    product_likes.value = data.value
  if (error.value)
    notify({ type: 'error', title: 'Не удалось получить лайки', text: error.value.message })
}
await getProductLikes()
async function create() {
  const { data, error } = await useFetch('/api/productlikes/create', {
    method: 'POST',
    body: {
      url: url.value,
      amount: amount.value,
      period: period.value,
      productData: productData.value,
    },
  })
  if (error.value)
    return notify({ type: 'error', title: 'Что-то пошло не так', text: error.value.message })
  if (data.value) {
    notify({ type: 'success', title: 'Упешно' })
    getProductLikes()
  }
}
async function sendUrl() {
  const { data, error } = await useFetch('/api/productlikes/extract', {
    method: 'POST',
    body: {
      url: url.value,
    },
  })
  if (data.value) {
    productData.value = data.value
    urlError.value = false
  }
  if (error.value)
    urlError.value = true

  loadingUrl.value = false
}
let timeout = null as NodeJS.Timeout | null
async function changeUrl() {
  if (url.value === '')
    return
  loadingUrl.value = true
  if (timeout)
    clearTimeout(timeout)
  timeout = setTimeout(sendUrl, 2000)
}
function selectPeriod(event: any) {
  period.value = event.target.value
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
  url.value = ''
  amount.value = 0
}
onMounted(() => {

})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      Лайки на товар/бренд
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Выберите товар или бренд, чтобы повысить количество добавлений в «Избранное»
    </p>
    <div class="mb-4 mt-6 bg-base-200 p-6 rounded-lg">
      <div class="flex flex-wrap items-center gap-6 mb-2">
        <div class="relative">
          <div>Ссылка на бренд или товар:</div>
          <div class="input-group w-64 mt-2">
            <input
              v-model="url"
              :class="{
                'input-error': urlError,
                'input-success': productData,
              }"
              :disabled="productData"
              tabindex="0" class="input w-full input-sm" placeholder="Введите ссылку" type="text" @input="changeUrl"
            >
            <button
              :class="{
                'loading': loadingUrl,
                'btn-disabled': !productData,
              }"
              class="btn btn-sm btn-ghost btn-circle bg-base-100" @click="removeProduct"
            >
              <!-- Insert a backspace svg -->
              <div v-if="!loadingUrl">
                <IconCSS v-if="productData" class="w-6 h-6" name="fluent:backspace-24-regular" />
              </div>
            </button>
          </div>
        </div>
        <div>
          <div>Количество:</div>
          <div class="relative flex items-center ml-auto mt-2">
            <button
              :disabled="amount <= 0" class="absolute left-0 btn btn-ghost btn-sm btn-square"
              @click="amount -= 10"
            >
              <IconCSS size="16" name="ic:round-minus" />
            </button>
            <div class="input-sm rounded-lg w-24 text-center bg-base-100 ">
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
        <div>
          <div>Период выполнения:</div>
          <select :disabled="!productData" class="select w-44 select-sm mt-2" @change="selectPeriod">
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
        <div v-if="productData && productData.type === 'brand'" class="productinfo">
          <div>Информация о бренде:</div>
          <div class="flex gap-4 mt-2 items-start">
            <nuxt-img class="rounded-lg object-contain h-8" :src="productData.image" />
            <div class="name truncate">
              {{ productData.name }}
            </div>
          </div>
        </div>
        <div class="w-full ml-auto self-end justify-end lg:w-40">
          <button
            :class="{
              'btn-disabled': !productData || amount <= 0,
            }" class="btn btn w-full btn-primary"
            @click="create"
          >
            Добавить
          </button>
        </div>
      </div>
      <div v-if="productData && productData.type === 'product'" class="productinfo mt-4">
        <div>Информация о товаре:</div>
        <div class="flex gap-4 mt-2 items-start">
          <nuxt-img width="32" class="rounded-lg object-contain w-8" :src="productData.image" />
          <div class="article">
            <a
              :href="`https://www.wildberries.ru/catalog/${productData.article}/detail.aspx`" target="_blank"
              class="text-sm text-secondary link link-hover"
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
    <div v-if="product_likes.length">
      <DataTable v-if="width > 1024" class="bg-base-200 hidden lg:block" :value="product_likes">
        <Column field="place" header="№" />
        <Column field="image" header="Фото">
          <template #body="{ data }">
            <nuxt-img class="rounded-lg object-contain h-8" :src="data.image" />
          </template>
        </Column>
        <Column field="link" header="Ссылка">
          <template #body="{ data }">
            <a
              :href="data.url" target="_blank"
              class="text-secondary link link-hover"
            >
              {{ data.name }}
            </a>
          </template>
        </Column>
        <Column field="type" header="Тип">
          <template #body="{ data }">
            <div>{{ data.type === 'brand' ? 'Бренд' : 'Товар' }}</div>
          </template>
        </Column>
        <Column field="amount" header="Количество" />

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
      <ul v-else class="w-full lg:hidden">
        <li v-for="(item, index) in product_likes" :key="index" class="pb-3 sm:pb-4">
          <div tabindex="0" class=" relative collapse collapse-arrow bg-base-200 rounded-box">
            <div class="collapse-title font-medium ">
              <div class="text-gray-400 right-3 date text-start text-xs pb-2">
                <div>
                  {{ $dayjs(item.createdDate).format('D MMMM HH:mm') }}
                </div>
              </div>
              <div class="flex gap-6 items-center w-full">
                <div class="flex gap-4 items-start flex-wrap">
                  <div class="image">
                    <nuxt-img width="32" class="rounded-lg object-contain" :src="item.image" />
                  </div>
                  <div class="article flex flex-col gap-0.5">
                    <div class="text-xs">
                      Ссылка
                    </div>
                    <a
                      :href="item.url" target="_blank"
                      class="text-secondary link link-hover text-sm truncate w-48"
                    >
                      {{ item.name }}
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
                </div>
              </div>
            </div>
            <div class="collapse-content flex gap-4">
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                  Тип
                </dt>
                <dd class="font-semibold text-sm">
                  <div>{{ item.type === 'brand' ? 'Бренд' : 'Товар' }}</div>
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                  Дата завершения
                </dt>
                <dd class="font-semibold text-sm">
                  <div v-if="item.endedDate">
                    {{ $dayjs(item.endedDate).format('D MMMM HH:mm') }}
                  </div>
                  <div v-else>
                    Нет
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </li>
      </ul>
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
