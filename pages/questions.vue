<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Вопросы',
})
const { $dayjs } = useNuxtApp()
const product_likes = ref([]) as any
const amount = ref(0)
const now = useNow()
const publishDate = ref(now.value)
const loadingUrl = ref(false)
const questionText = ref('')
const article = ref('')
const sex = ref('male')
const productData = ref<any>(null)
const urlError = ref(false)
async function getQuestions() {
  const { data, error } = await useFetch('/api/questions/get', { method: 'GET' })
  if (data.value)
    product_likes.value = data.value
  if (error.value)
    notify({ type: 'error', title: 'Не удалось получить лайки', text: error.value.message })
}
await getQuestions()
async function create() {
  const { data, error } = await useFetch('/api/questions/create', {
    method: 'POST',
    body: {
      article: article.value,
      publishDate: publishDate.value,
      gender: sex.value,
      productData: productData.value,
      questionText: questionText.value,
    },
  })
  if (error.value)
    return notify({ type: 'error', title: 'Что-то пошло не так', text: error.value.message })
  if (data.value) {
    notify({ type: 'success', title: 'Упешно' })
    removeProduct()
    publishDate.value = now.value
    getQuestions()
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
function selectSex(event: any) {
  sex.value = event.target.value
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
      Вопросы
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Выберите товар, чтобы добавить конкретные вопросы к нему
    </p>
    <div class="collapse collapse-plus bg-base-200 rounded-box mb-4 mt-6">
      <input type="checkbox">

      <div class="collapse-title text-xl font-medium">
        Добавить вопрос
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
              <div>Дата публикации:</div>
              <div class="relative w-full p-4 bg-base-100 rounded-lg mt-2">
                <div class="absolute left-3 top-1.5 text-sm mt-auto">
                  {{ publishDate <= now ? 'Опубликовать сейчас'
                    : $dayjs(publishDate).format('D MMMM HH:mm') }}
                </div>
                <div class="absolute right-0 top-0 w-60" style="z-index: 9999999">
                  <DatePicker v-model="publishDate" class="w-40" />
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 flex gap-6 items-start flex-wrap lg:flex-nowrap">
            <div class="w-full lg:w-1/3">
              <div>Пол:</div>
              <select class="select select-sm w-full mt-2" @change="selectSex">
                <option value="male">
                  Мужской
                </option>
                <option value="female">
                  Женский
                </option>
              </select>
            </div>
            <div class="w-full lg:w-2/3">
              <div>Вопрос к товару:</div>
              <textarea v-model="questionText" rows="1" class="textarea w-full py-0 h-4 bg-base-100 mt-2" />
              <label class="label py-0">
                <span class="label-text-alt">От до 10 до 1000 символов</span></label>
            </div>
          </div>
          <div class="w-full ml-auto self-start justify-start mt-2 lg:w-40">
            <button
              :class="{
                'btn-disabled': !productData || !questionText,
              }" class="btn btn w-full btn-primary"
              @click="create"
            >
              Добавить
            </button>
          </div>
          <div v-if="productData" class="productinfo mt-4">
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
      </div>
    </div>

    <div v-if="product_likes.length">
      <DataTable class="bg-base-200" :value="product_likes">
        <Column field="place" header="№" />
        <Column field="image" header="Фото">
          <template #body="{ data }">
            <nuxt-img class="rounded-lg object-contain h-8" :src="data.image" />
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
        <Column field="gender" header="Пол">
          <template #body="{ data }">
            <div>{{ data.gender === 'male' ? 'М' : 'Ж' }}</div>
          </template>
        </Column>
        <Column field="text" header="Вопрос" />

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
        <Column field="publishDate" header="Дата публикации">
          <template #body="{ data }">
            <div v-if="data.publishDate">
              {{ $dayjs(data.publishDate).format('D MMMM HH:mm') }}
            </div>
            <div v-else>
              Нет
            </div>
          </template>
        </Column>
      </DataTable>
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
