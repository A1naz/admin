<script setup lang="tsx">
import { useNotification } from '@kyvg/vue3-notification'
import { useWindowSize } from '@vueuse/core'
import { useMainStore } from '@/stores/main'
import type { Rule } from '@/data/buyout/rules'
import { rules } from '@/data/buyout/rules'

const { $dayjs } = useNuxtApp()
const currency = useCurrency()

const { width, height } = useWindowSize()
const { notify } = useNotification()
const disabledCreateButton = ref(false)
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
  searchQuery: string[]
  adress: string
  dateRange: [Date | null, Date | null]
  selectedSize: number | string
  rules: Rule[]
}

const defaultRules: Rule[] = rules
const route = useRoute()
const store = useMainStore()
const article = ref('')
const products = ref<Item[]>([])
const loading = ref(false)
const now = useNow()

const startDate = new Date(now.value)
const endDate = new Date(now.value)
startDate.setHours(9, 0)
endDate.setHours(20, 0)

async function addProduct() {
  if (!article.value)
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
    searchQuery: [''],
    selectedSize: product.sizes[0] ?? 'none',
    priceText: product.priceText,
    rules: [],
  }))
}

function removeSearchQuery(index: number, place: number) {
  products.value[index].searchQuery.splice(place, 1)
}

function addSearchQuery(index: number) {
  products.value[index].searchQuery.push('')
}

function onDateRangeChange(value: unknown[], index: number) {
  products.value[index].dateRange = value as [Date | null, Date | null]
}
interface ISearchQueryChange { value: string; queryIndex: number; productIndex: number }

function onSearchQueryChange(options: ISearchQueryChange) {
  products.value[options.productIndex].searchQuery[options.queryIndex] = options.value
}

function onQuantityChange(value: number, index: number) {
  products.value[index].quantity = value
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
  const rules = products.value[index].rules
  const finded = defaultRules.find(item => item.id === rule)
  if (!finded)
    return
  if (target.checked) {
    if (finded.id === 8) {
      rules.forEach((rule, index) => {
        if (rule.id >= 10)
          rules.splice(index, 1)
      })
    }
    products.value[index].rules.push(finded)
  }
  else { rules.splice(rules.indexOf(finded), 1) }
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
    if (!item.searchQuery[0]) {
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
  disabledCreateButton.value = true
  const { data, error } = await useFetch('/api/buyout/create', {
    method: 'POST',
    body: JSON.stringify(products.value),
  })
  disabledCreateButton.value = false

  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data.message,
      type: 'error',
      duration: 3000,
    })
  }
  else if (data.value!.status === 'ok') {
    notify({
      title: 'Выкуп успешно создан',
      type: 'success',
      duration: 3000,
    })
    navigateTo('/buyouts')
  }
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
        rules: [],
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
    <h1 class="text-2xl font-bold mt-4">
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
          @update-sex="onSexChange" @update-size="onSizeChange" @update-date-range="onDateRangeChange"
          @add-search-query="addSearchQuery" @remove-search-query="removeSearchQuery" @update-search-query="onSearchQueryChange"
          @update-quantity="onQuantityChange"
        />
      </div>
      <div v-else class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin">
        <table class="table table-compact w-full mt-4">
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
                Поисковые запросы
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
            <BuyoutCreateTableRow
              v-for="(product, index) in products" :key="index" :product="product" :index="index" :loading="!pickpoints?.length" @point-modal-open="pointModalOpen" @remove="removeProduct"
              @update-sex="onSexChange" @update-size="onSizeChange" @update-date-range="onDateRangeChange"
              @add-search-query="addSearchQuery" @remove-search-query="removeSearchQuery" @update-search-query="onSearchQueryChange"
              @update-quantity="onQuantityChange"
            />
          </tbody>
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
      <button class="btn btn-primary btn-sm normal-case" :disabled="disabledCreateButton" @click="createBuyout">
        {{ products.length > 1 ? `Создать
                            выкупы` : `Создать выкуп` }}
      </button>
    </div>
    <!-- refactor this -->
    <div v-for="(product, index) of products" :key="index">
      <input :id="`modal${index}`" type="checkbox" class="modal-toggle">
      <label :for="`modal${index}`" class="modal modal-bottom sm:modal-middle">
        <label for="" class="modal-box relative">
          <label
            :for="`modal${index}`"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >✕</label>
          <h3 class="font-bold text-lg mb-2">Выберите нужные правила для этого выкупа</h3>
          <div v-for="(rule) of defaultRules" :key="rule.id" class="">
            <div class="label cursor-pointer flex gap-4 items-start">
              <span class="label-text">{{ rule.id }}. {{ rule.description }}</span>
              <input
                :disabled="!!product.rules.find(item => item.category === rule.category && item.id !== rule.id) || !!product.rules.find(item => item.id === rule?.relies)"
                type="checkbox" class="checkbox checkbox-primary"
                :checked="product.rules.indexOf(rule) > -1"
                @change="onRuleChange($event, index, rule.id)"
              >
            </div>
          </div>
        </label>
      </label>
    </div>
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
