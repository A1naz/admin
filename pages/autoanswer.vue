<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Автоответчик на отзывы',
})
const { $dayjs } = useNuxtApp()
const store = useMainStore()

const form = reactive({
  ratingFilterFrom: 1,
  ratingFilterTo: 5,
  text: '',
  article: '',
  product: '',
  apiKey: store.client.wbApiKeys[0],
})
const initial = {
  ratingFilterFrom: 1,
  ratingFilterTo: 5,
  text: '',
  article: '',
  product: '',
  apiKey: store.client.wbApiKeys[0],
}
const autoanswers = ref([]) as any
const amount = ref(0)
const now = useNow()
const loading = ref(false)
const loadingUrl = ref(false)
const query = ref('')
const article = ref('')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
await getBots()
async function getBots() {
  const { data, error } = await useFetch('/api/autoanswer/get', { method: 'GET' })
  if (data.value)
    autoanswers.value = data.value
}
async function deleteBot(id: string) {
  const { data, error } = await useFetch('/api/autoanswer/delete', {
    method: 'POST',
    body: {
      id,
    },
  })
  if (data.value) {
    notify({
      title: 'Автоответчик успешно удален',
    })
    getBots()
  }
  if (error.value) {
    notify({
      title: error.value.message,
    })
  }
}

async function createAutoAnswer() {
  if (!productData.value)
    return
  form.product = productData.value
  form.article = article.value
  form.ratingFilterFrom = Number(form.ratingFilterFrom)
  form.ratingFilterTo = Number(form.ratingFilterTo)

  loading.value = true
  const { data, error } = await useFetch('/api/autoanswer/create', {
    method: 'POST',
    body: form,
  })
  loading.value = false
  if (error.value) {
    if (error.value.data) {
      notify({
        title: 'Что-то пошло не так',
        text: error.value.data.message,
      })
      return
    }
    notify({
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
    return
  }
  if (data.value?.status === 'ok') {
    notify({
      title: 'Успешно',
      text: 'Автоответчик успешно создан',
    })
    await getBots()
    form.ratingFilterFrom = initial.ratingFilterFrom
    form.ratingFilterTo = initial.ratingFilterTo
    form.text = initial.text
    form.article = initial.article
    form.product = initial.product
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
  timeout = setTimeout(getProductInfo, 500)
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
    <h1 class="text-2xl font-bold mt-4">
      Автоответчик на отзывы (beta)
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Добавьте апи ключ в настройках профиля и настройте автоотвечик
    </p>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Стоимость одного автоответчика -  <span class="font-bold">100 руб.</span>
    </p>
    <div v-if="!store.client.wbApiKeys.length || store.client.wbApiKeys[0] === ''" class="alert alert-info mt-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>Добавьте апи ключ в настройках профиля для работы Автоответчика</span>
    </div>
    <div class="collapse collapse-plus bg-base-200 rounded-box mb-4 mt-6">
      <input type="checkbox">

      <div class="collapse-title text-xl font-medium">
        Добавить автоответчик
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
                  :disabled="!productData"
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
            <div class="w-full">
              <div>Апи-ключ:</div>
              <select v-model="form.apiKey" class="select select-bordered w-full select-sm mt-2">
                <option v-if="store.client.wbApiKeys[0] === ''" disabled selected>
                  У вас нет привязанных ключей
                </option>
                <option v-for="key of store.client.wbApiKeys" :key="key" :value="key">
                  {{ key }}
                </option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex gap-6 items-start flex-wrap justify-stretch flex-1 lg:flex-nowrap">
            <div class="w-full lg:w-1/3 flex flex-col gap-4">
              <div>Фильтр по оценке:</div>
              <div>
                <div class="flex justify-center items-center mt-2 gap-1">
                  <span>От {{ form.ratingFilterFrom }} </span><Icon color="rgb(250 204 21)" size="20" name="fluent:star-24-filled" />
                </div>
                <input v-model="form.ratingFilterFrom" type="range" min="1" max="5" class="range range-sm range-primary" step="1">
                <div class="w-full flex justify-between text-xs px-2">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
              <div>
                <div class="flex justify-center items-center mt-2 gap-1">
                  <span>До {{ form.ratingFilterTo }} </span><Icon color="rgb(250 204 21)" size="20" name="fluent:star-20-filled" />
                </div>
                <input v-model="form.ratingFilterTo" type="range" min="1" max="5" class="range range-sm range-primary" step="1">
                <div class="w-full flex justify-between text-xs px-2">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </div>
            <div class="w-full self-stretch lg:w-2/3">
              <textarea v-model="form.text" class="textarea w-full h-full" placeholder="Ответ" />
            </div>
          </div>
          <div class="w-full ml-auto self-start justify-start mt-2 lg:w-40">
            <button
              :disabled="!productData || !form.text || loading"
              class="btn w-full btn-primary"
              @click="createAutoAnswer"
            >
              Добавить
            </button>
          </div>
          <div v-if="productData" class="productinfo mt-4">
            <div class="flex text gap-4 mt-2 items-start">
              <nuxt-img width="48" class="rounded-lg object-contain w-12" :src="productData.image" loading="lazy" />
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

    <div v-if="autoanswers.length">
      <div class="flex flex-wrap gap-2">
        <AutoanswerCard v-for="(bot, index) of autoanswers" :key="index" :info="bot" @delete="deleteBot" />
      </div>
    </div>
    <Hero v-else />
  </div>
</template>

<style scoped></style>
