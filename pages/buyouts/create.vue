<script setup lang="tsx">
import { useNotification } from '@kyvg/vue3-notification'
import { useWindowSize } from '@vueuse/core'
import type { Rule } from '@/data/buyout/rules'
import { rules } from '@/data/buyout/rules'
import type { ISearchQueryChange } from '@/stores/buyout'

const { $dayjs } = useNuxtApp()
const currency = useCurrency()

const { width, height } = useWindowSize()
const { notify } = useNotification()

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Добавить выкупы',
})

const disabledCreateButton = ref(false)
const selectPointModal = ref<HTMLElement>()
const infoModal = ref<HTMLDialogElement>()
const store = useBuyoutStore()

const defaultRules: Rule[] = rules
const route = useRoute()
const article = ref<number>()
const products = computed(() => store.createProducts)
const loading = ref(false)
const now = useNow()

async function addProduct() {
  if (!article.value)
    return
  loading.value = true
  store.addProduct(article.value).finally(() => {
    loading.value = false
  })
}

function removeSearchQuery(index: number, place: number) {
  store.removeSearchQuery(index, place)
}

function addSearchQuery(index: number) {
  store.addSearchQuery(index)
}

function onDateRangeChange(value: unknown[], index: number) {
  store.changeDateRange(value, index)
}

function onSearchQueryChange(options: ISearchQueryChange) {
  store.changeSearchQuery(options)
}

function onQuantityChange(value: number, index: number) {
  store.changeQuantity(value, index)
}

function onSizeChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  store.changeSize(target.value, index)
}

function onSexChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  store.changeSex(target.value, index)
}

function onRuleChange(event: Event, index: number, rule: number) {
  const target = event.target as HTMLInputElement
  store.changeRule(target.checked, index, rule)
}

function removeProduct(index: number) {
  store.removeProduct(index)
}

function handleAddress(address: string) {
  store.handleAddress(address)
}
function openInfoModal() {
  infoModal.value?.showModal()
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
    await store.cloneBuyout(route.query.uuid.toString())
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
          :product="product" :index="index" @point-modal-open="pointModalOpen"
        />
      </div>
      <div v-else class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin">
        <table class="table table-sm table-zebra w-full mt-4">
          <thead class="relative mb-2 text-sm text-base-content" @click="openInfoModal">
            <tr>
              <th class="">
                №
              </th>
              <th class="w-12 text-center">
                <IconCSS name="material-symbols:image-outline" size="20" />
              </th>
              <th class="w-48">
                Название
              </th>
              <th>
                <div class="flex justify-between w-full gap-2">
                  <span>
                    Цена
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th>
                <div class="flex justify-between w-full gap-2 ">
                  <span>
                    Количество
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th>
                <div class="flex justify-between w-full gap-2">
                  <span>
                    Размер
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th>
                <div class="flex justify-between w-full gap-2">
                  <span>
                    Пол
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th>
                <div class="flex justify-between w-full gap-2">
                  <span>
                    Поисковые запросы
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th class="min-w-40">
                <div class="flex justify-between w-full gap-2">
                  <span>
                    Адрес
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th>
                <div class="flex justify-between w-full gap-2">
                  <span>
                    Даты выкупов
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th>
                <div class="flex justify-between w-full gap-2">
                  <span>
                    Правила
                  </span>
                  <span>
                    ?
                  </span>
                </div>
              </th>
              <th class="text-base-content" />
            </tr>
            <progress
              v-show="loading"
              class="progress absolute bottom-[-2] mb-2 z-10 progress-primary w-full"
            />
          </thead>

          <tbody>
            <BuyoutCreateTableRow
              v-for="(product, index) in products" :key="index" :product="product" :index="index" :loading="!pickpoints?.length" @point-modal-open="pointModalOpen"
            />
          </tbody>
        </table>
      </div>
      <BuyoutSelectPointModal
        v-if="modalOpen" :state="modalOpen" :pickpoints="pickpoints" @callback="handleAddress"
        @close="closeModal"
      />
    </ClientOnly>
    <div v-show="products.length" class="mt-6 flex justify-between items-center h-48">
      <div>
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
    <dialog id="infoModal" ref="infoModal" class="modal">
      <form method="dialog" class="modal-box">
        <h3 class="font-bold text-lg">
          Информация
        </h3>
        <div class="py-4 flex flex-col gap-2">
          <p>
            <span class="font-bold">
              Изображение
            </span>
            - Увеличивайте изображение товара просто наводя на него курсором
          </p>
          <p>
            <span class="font-bold">
              Цена
            </span>
            - Цена товара указана без СПП
          </p>
          <p>
            <span class="font-bold">
              Количество
            </span>
            - Указывайте желаемое количество выкупов, но не более 3 штук на 1 ПВЗ в сутки
          </p>
          <p>
            <span class="font-bold">
              Размер
            </span>
            - Выберите желаемый размер товара
          </p>
          <p>
            <span class="font-bold">
              Пол
            </span>
            - Выберите желаемый Пол для выкупов
          </p>
          <div>
            <div>
              <span class="font-bold">
                Поисковые запросы
              </span>
              - Введите поисковые запросы, чем больше, тем лучше нажимая на "+"
            </div>
            <div class="text-sm">
              Например, при указании 5 поисковых запросов - каждый будет выкупаться по своему запросу, если по данному запросу товар не найден, то запрос игнорируется.
            </div>
          </div>

          <p>
            <span class="font-bold">
              Адрес
            </span>
            - Добавьте Адрес желаемого ПВЗ от куда вы будете забирать товар
          </p>
          <p>
            <span class="font-bold">
              Даты выкупов
            </span>
            - Выберите желаемый диапазон дат и времени для выкупов
          </p>
          <p>
            <span class="font-bold">
              Правила
            </span>
            - Используйте Правила для создания дополнительной безопасности ваших выкупов
          </p>
        </div>
        <div class="modal-action">
          <button class="btn">
            Закрыть
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
th {
    @apply normal-case hover:text-primary hover:cursor-pointer;
}

table td,
table td * {
    vertical-align: top;
}
</style>
