<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Автоответчик на отзывы',
})
const { $dayjs } = useNuxtApp()
const form = reactive({
  ratingFilterFrom: 1,
  ratingFilterTo: 5,
  text: '',
  article: '',
  product: '',
})

const carts = ref([]) as any
const amount = ref(0)
const now = useNow()
const loadingUrl = ref(false)
const query = ref('')
const article = ref('')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)

async function createAutoAnswer() {
  if (!productData.value)
    return
  form.product = productData.value
  form.article = article.value
  const { data, error } = await useFetch('/api/autoanswer/create', {
    method: 'POST',
    body: form,
  })
  if (data.value?.status === 'ok') {
    notify({
      title: 'Успешно',
      text: 'Автоответчик успешно создан',
    })
  }
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
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
      Вкладка в разработке
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Добавьте апи ключ в настройках профиля и настройте автоотвечик
    </p>
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
              :disabled="!productData || !form.text"
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

    <div v-if="carts.length">
      <ClientOnly>
        <DataTable v-if="width > 1024" class="bg-base-200 hidden lg:block" :value="carts">
          <Column field="place" header="№" />
          <Column field="image" header="Фото">
            <template #body="{ data }">
              <nuxt-img class="rounded-lg object-contain h-8" width="32" :src="data.image" loading="lazy" />
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
                  <nuxt-img width="32" class="rounded-lg object-contain" :src="item.image" loading="lazy" />
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
