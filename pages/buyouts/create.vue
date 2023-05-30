<script setup lang="tsx">
import { useNotification } from '@kyvg/vue3-notification'
import { useWindowSize } from '@vueuse/core'
import { useMainStore } from '~~/stores/main'

const { $dayjs } = useNuxtApp()
const currency = useCurrency()

const { width, height } = useWindowSize()
const { notify } = useNotification()
const dp = ref()
const headers = useRequestHeaders(['cookie']) as HeadersInit
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Добавить выкупы',
})
const selectPointModal = ref() as Ref<HTMLElement>

interface Item {
  image: string
  name: string
  article: number
  price: number
  priceText: string
  quantity: number
  sizes: number[] | string[]
  sex: string
  searchQuery: string
  adress: string
  dateRange: [Date | null, Date | null]
  selectedSize: number | string
  rules: {
    [key: number]: boolean
  }
}

const defaultRules = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false,
  10: false,
}
const route = useRoute()
const store = useMainStore()
const article = ref('')
const products = ref<Item[]>([])
const loading = ref(false)
const now = useNow()
const startDate = new Date(now.value)
const endDate = new Date(now.value)
startDate.setHours(9, 0)
endDate.setDate(startDate.getDate() + 7)
endDate.setHours(20, 0)
async function addProduct() {
  if (article.value === '')
    return

  loading.value = true

  const { data, error } = await useFetch(`/api/product/${article.value}`, {
    method: 'GET',
  })
  loading.value = false
  if (error.value) {
    notify({
      title: 'Ошибка',
      text: error.value?.data?.message,
      type: 'error',
    })
  }

  const product = (data.value as any).product as unknown as Item
  products.value.push(reactive({
    image: product.image,
    name: product.name,
    article: product.article,
    price: product.price,
    quantity: 1,
    sex: 'Нет',
    sizes: product?.sizes,
    dateRange: [startDate, endDate],
    adress: '',
    searchQuery: '',
    selectedSize: product.sizes[0] ?? 'none',
    priceText: product.priceText,
    rules: defaultRules,
  }))
}

function onSizeChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  products.value[index].selectedSize = target.value
}

function onSexChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  products.value[index].sex = target.value
}

function onRuleChange(event: Event, index: number, rule: number) {
  const target = event.target as HTMLInputElement
  products.value[index].rules[rule] = target.checked
}
function removeProduct(index: number) {
  products.value.splice(index, 1)
}

const totalSum = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)
})
const totalQuantity = computed(() => {
  return products.value.reduce((acc, item) => {
    return acc + item.quantity
  }, 0)
})
const pickpoints = shallowRef()
const modalOpen = ref(false)
function closeModal() {
  modalOpen.value = false
}

function handleAddress(address: string) {
  const index = store.selectedItem!
  products.value[index].adress = address
}

async function createBuyout() {
  let valid = true
  let errorMsg = ''
  products.value.forEach((item) => {
    if (!item.adress) {
      valid = false
      errorMsg = 'Не у всех товаров указан адрес доставки'
    }
    if (!item.dateRange[0] || !item.dateRange[1]) {
      valid = false
      errorMsg = 'Не у всех товаров указаны даты выкупов'
    }
    if (!item.searchQuery) {
      valid = false
      errorMsg = 'Не у всех товаров указан поисковый запрос'
    }
    if (!item.selectedSize)
      item.selectedSize = 'none'
  })
  if (!valid) {
    notify({
      title: 'Что-то пошло не так',
      text: errorMsg,
      type: 'error',
      duration: 3000,
    })
    return
  }
  const { data, error } = await useFetch('/api/buyout/create', {
    method: 'POST',
    body: JSON.stringify(products.value),
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data.message,
      type: 'error',
      duration: 3000,
    })
    return
  }
  notify({
    title: 'Выкуп успешно создан',
    type: 'success',
    duration: 3000,
  })
  navigateTo('/buyouts')
}

watch(products.value, (old, value) => {
  value.forEach((item, index) => {
    if (item.quantity < 1)
      products.value[index].quantity = 1

    if (item.quantity > 1000)
      products.value[index].quantity = 1000
  })
})

async function getPickpoints() {
  try {
    const data = await $fetch('/api/buyout/pickpoints', {
      method: 'GET',
      headers,
    })
    pickpoints.value = (data as any).points
    loading.value = false
  }
  catch (e: any) {
    notify({
      title: 'Что-то пошло не так',
      text: e?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

async function pointModalOpen(index: number) {
  if (!pickpoints.value)
    loading.value = true

  store.selectedItem = index
  modalOpen.value = true
}
onMounted(async () => {
  getPickpoints()
  if (route.query.uuid) {
    loading.value = true
    const { data, error } = await useFetch('/api/buyout/clone', {
      query: {
        uuid: route.query.uuid,
      },
      method: 'GET',
      headers,
    })
    if (error.value) {
      notify({
        title: 'Что-то пошло не так',
        text: error.value?.data.message,
        type: 'error',
        duration: 3000,
      })
      return
    }
    if (data.value) {
      const product = {
        ...data.value,
        rules: defaultRules,
        dateRange: [startDate, endDate],
      }
      products.value.push(product as any)
    }
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      Добавить выкупы
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Создайте новые выкупы. Введите артикулы товаров и заполните необходимые данные.
    </p>
    <div class="mt-6 flex items-center">
      <div class="relative flex justify-end items-center flex-grow-0 w-60">
        <input
          v-model="article" type="number" placeholder="Артикул" class="input input-sm input-bordered w-full"
          @keydown.enter="addProduct"
        >
        <button class="btn btn-ghost btn-sm absolute normal-case" @click="addProduct">
          Добавить
        </button>
      </div>
    </div>
    <ClientOnly>
      <div v-if="width < 1500" class="products-card grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <BuyoutCreateCard
          v-for="(product, index) in products" :key="index" :loading="!pickpoints?.length"
          :product="product" :index="index" @point-modal-open="pointModalOpen" @remove="removeProduct"
          @change-sex="onSexChange" @change-size="onSizeChange"
        />
      </div>
      <div v-else class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin">
        <table class="table table-compact w-full mt-4">
          <!-- head -->
          <thead class="relative mb-2">
            <tr>
              <th class="">
                №
              </th>
              <th class="w-12">
                <IconCSS name="material-symbols:image-outline" size="20" />
              </th>
              <th class="w-48">
                Название
              </th>
              <th>
                Цена
              </th>
              <th>
                Количество
              </th>
              <th>
                Размер
              </th>
              <th>
                Пол
              </th>
              <th>
                Поисковый запрос
              </th>
              <th class="min-w-40">
                Адрес
              </th>
              <th>
                Даты выкупов
              </th>
              <th>
                Правила
              </th>
            </tr>
            <progress
              v-show="loading"
              class="progress absolute bottom-[-2] mb-2 z-10 progress-primary w-full"
            />
          </thead>

          <tbody>
            <tr v-for="(product, index) in products" :key="product.article">
              <td>
                {{ index + 1 }}
              </td>
              <td>
                <div
                  style="width: 28px; height: 36px; overflow: visible; position: relative; border-radius: 4px"
                >
                  <div class="dropdown dropdown-hover">
                    <label tabindex="0"> <nuxt-img
                      class="rounded-lg" loading="lazy" fit="fill"
                      :src="product.image"
                    />
                    </label>
                    <ul
                      tabindex="0"
                      class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <nuxt-img
                        class="rounded-lg" loading="lazy" fit="fill"
                        :src="product.image"
                      />
                    </ul>
                  </div>
                </div>
              </td>
              <td class="">
                <div class="w-48 truncate">
                  <div class="text-sm font-medium truncate">
                    {{ product.name }}
                  </div>
                  <a
                    :href="`https://www.wildberries.ru/catalog/${product.article}/detail.aspx`"
                    target="_blank" class="text-sm text-secondary link link-hover"
                  >
                    {{ product.article }}
                  </a>
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ product.priceText }}
                </div>
              </td>
              <td>
                <div class="relative flex items-center flex-grow-0 w-full">
                  <div
                    class="absolute left-0 btn btn-ghost btn-sm btn-square"
                    @click="product.quantity--"
                  >
                    <IconCSS size="16" name="ic:round-minus" />
                  </div>
                  <input
                    v-model="product.quantity" type="number" min="1" max="1000"
                    class="input input-bordered input-sm w-full text-center"
                  >
                  <div
                    class="absolute right-0 btn btn-ghost btn-sm btn-square"
                    @click="product.quantity++"
                  >
                    <IconCSS size="16" name="ic:round-plus" />
                  </div>
                </div>
              </td>
              <td>
                <div class="w-20 2xl:w-full flex items-center">
                  <select
                    v-if="product.sizes.length" class="select select-sm select-bordered w-full"
                    @change="onSizeChange($event, index)"
                  >
                    <option
                      v-for="size in product.sizes" :key="size"
                      :selected="product.selectedSize === size" :value="size"
                    >
                      {{ size }}
                    </option>
                  </select>
                  <div v-else class="text-sm text-center ml-2">
                    Нет
                  </div>
                </div>
              </td>
              <td>
                <div class="w-20 2xl:w-full">
                  <select
                    class="select select-sm select-bordered w-full appearance-none"
                    @change="onSexChange($event, index)"
                  >
                    <option value="none">
                      Нет
                    </option>
                    <option value="male">
                      Муж
                    </option>
                    <option value="female">
                      Жен
                    </option>
                  </select>
                </div>
              </td>
              <td>
                <div class="w-full">
                  <input
                    v-model="product.searchQuery" type="text" placeholder="Ввести"
                    class="input input-bordered input-sm w-full"
                  >
                  <label class="label">
                    <span class="label-text-alt">Новый запрос через запятую</span>
                  </label>
                </div>
              </td>
              <td class="break-all">
                <div class="w-full flex flex-col items-start justify-center gap-1 flex-wrap overflow-hidden">
                  <div v-if="product.adress" class="text-xs mb-1 h-10 w-40 break-all">
                    <p class="break-all whitespace-normal">
                      {{ product.adress }}
                    </p>
                  </div>
                  <button
                    :disabled="!pickpoints" :class="{
                      'btn-outline': product.adress,
                      'loading': !pickpoints,
                    }" class="btn btn-primary btn-sm normal-case w-full" @click="pointModalOpen(index)"
                  >
                    {{ product.adress
                      ? 'Изменить' : 'Добавить' }}
                  </button>
                </div>
              </td>
              <td>
                <div class="flex items-center">
                  <div class="w-full">
                    <div v-show="product.dateRange[1] && product.dateRange[0]" class="text-sm flex flex-col justify-center items-start mb-2">
                      <div>
                        {{ `С ${$dayjs(product.dateRange[0]).format('D MMMM HH:mm')}` }}
                      </div>
                      <div> {{ `По ${$dayjs(product.dateRange[1]).format('D MMMM HH:mm')}` }}</div>
                    </div>
                    <BuyoutDateRangePicker v-model="product.dateRange" :start-date="startDate" />
                  </div>
                </div>
              </td>
              <td>
                <div class="w-full flex justify-between">
                  <label
                    :for="`modal${index}`" :class="{
                      'btn-outline': product.rules,
                    }" class="btn btn-primary btn-sm normal-case "
                  >{{ 'Настроить' }}
                  </label>
                  <div class="ml-2 w-8 btn btn-ghost btn-sm btn-square" @click="removeProduct(index)">
                    <IconCSS name="material-symbols:close" size="20" />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
          <!-- foot -->
        </table>
      </div>
      <BuyoutSelectPointModal
        v-if="modalOpen" :state="modalOpen" :pickpoints="pickpoints" @callback="handleAddress"
        @close="closeModal"
      />
    </ClientOnly>

    <div v-if="products.length" class="mt-6 flex justify-between items-center">
      <div class="info">
        <div class="text-sm">
          <span class="text-gray-500">Товаров:</span> <span class="font-bold">{{ totalQuantity
          }} шт.</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500">Сумма:</span> <span class="font-bold">{{ currency.format(totalSum)
          }}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-sm normal-case" @click="createBuyout">
        {{ products.length > 1 ? `Создать
                            выкупы` : `Создать выкуп` }}
      </button>
    </div>

    <Teleport to="body">
      <div v-for="(product, index) of products" :key="index">
        <input :id="`modal${index}`" type="checkbox" class="modal-toggle">
        <label :for="`modal${index}`" class="modal modal-bottom sm:modal-middle">
          <label for="" class="modal-box relative">
            <label
              :for="`modal${index}`"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >✕</label>
            <h3 class="font-bold text-lg mb-2">Выберите нужные правила для этого выкупа</h3>
            <label v-for="(value, key) of products[index].rules" :key="key" class="label cursor-pointer">
              <span class="label-text text-lg">Правило {{ key }}</span>
              <input
                type="checkbox" class="checkbox checkbox-primary"
                @change="onRuleChange($event, index, key)"
              >
            </label>
          </label>
        </label>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
th {
    @apply normal-case;
}

table td,
table td * {
    vertical-align: top;
}

select {
    /* for Firefox */
    -moz-appearance: none;
    /* for Chrome */
    -webkit-appearance: none;
    appearance: none;
}

/* For IE10 */
select::-ms-expand {
    display: none;
}
</style>
