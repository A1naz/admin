<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Вопросы',
})
const { $dayjs } = useNuxtApp()
const questions = ref([]) as any
const amount = ref(0)
const now = useNow()
const publishDate = ref(now.value)
const loadingUrl = ref(false)
const questionText = ref('')
const article = ref('')
const sex = ref('male')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
async function getQuestions() {
  const { data, error } = await useFetch('/api/questions/get', { method: 'GET' })
  if (data.value)
    questions.value = data.value
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
  else if (status === 'nofunds')
    return 'Недостаточно средств'
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
      Вопросы
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Выберите товар, чтобы добавить конкретные вопросы к нему
    </p>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Стоимость одного вопроса -  <span class="font-bold">3 руб.</span>
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
              }" class="btn w-full btn-primary"
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

    <div v-if="questions.length">
      <ClientOnly>
        <DataTable v-if="width > 1024" class="bg-base-200 hidden lg:block" :value="questions">
          <Column field="place" header="№" />
          <Column field="image" header="Фото">
            <template #body="{ data }">
              <div
                style="width: 28px; height: 36px; overflow: visible; position: relative; border-radius: 4px"
              >
                <div class="dropdown dropdown-hover">
                  <label tabindex="0"> <nuxt-img
                    class="rounded-lg z-0" alt="" loading="lazy" fit="fill"
                    :src="data.image"
                  />
                  </label>
                  <ul
                    tabindex="0"
                    class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
                  >
                    <nuxt-img
                      class="rounded-lg z-[1]" loading="lazy" fit="fill"
                      :src="data.image"
                    />
                  </ul>
                </div>
              </div>
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
          <Column field="text" header="Вопрос">
            <template #body="{ data }">
              <p class="max-w-xs truncate">
                {{ data.text }}
              </p>
            </template>
          </Column>

          <Column field="status" header="Статус">
            <template #body="{ data }">
              <div
                :class="{
                  'text-error': data.status === 'nofunds',
                  'text-primary': data.status === 'created',
                  'text-warning': data.status === 'work',
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
        <div v-else class="cards grid grid-cols-1 gap-4 lg:hidden">
          <div v-for="(item, index) in questions" :key="index" class="card card-compact bg-base-100 shadow-xl">
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
                <div class="date ml-auto text-xs text-end">
                  {{ $dayjs(item.createdDate).format('D MMMM HH:mm') }}
                </div>
              </div>

              <div class="flex">
                <div class="article flex flex-col gap-0.5">
                  <p class="p-2 bg-base-200 mt-2 rounded-lg max-h-20 overflow-auto">
                    {{ item.text }}
                  </p>
                </div>
              </div>
              <div class="card-actions justify-start mt-2">
                <div>Дата публикации:</div>
                <div>
                  {{ $dayjs(item.publishDate).format('D MMMM HH:mm') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
    <Hero v-else />
  </div>
</template>

<style scoped></style>
