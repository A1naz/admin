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
const ruleModal = ref(false)
const selectedRuleProductIndex = ref(0)
const selectPointModal = ref<HTMLElement>()
const checksModal = ref(false)
const infoModal = ref<HTMLDialogElement>()
const store = useBuyoutStore()
const infoType = ref('')
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

function ruleModalOpen(index: number) {
  ruleModal.value = true
  selectedRuleProductIndex.value = index
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
function openInfoModal(type: string) {
  infoType.value = type
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
function openChecksModal() {
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
  checksModal.value = true
}
async function createBuyout() {
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
    store.createProducts = []
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
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  ruleModal.value = false
  infoModal.value?.close()
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
          @rule-modal-open="ruleModalOpen"
        />
      </div>
      <div v-else class="products-table scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin">
        <table class="table table-xs table-zebra w-full mt-4">
          <thead class="relative mb-2 text-sm text-base-content">
            <tr>
              <th class="hidden 3xl:block">
                №
              </th>
              <th class="w-12 text-center" @click="openInfoModal('picture')">
                <IconCSS name="material-symbols:image-outline" size="20" />
              </th>
              <th class="w-36 3xl:w-48">
                Название
              </th>
              <th @click="openInfoModal('price')">
                <div class="flex justify-between w-full gap-1 items-center">
                  <span>
                    Цена
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
                    ?
                  </span>
                </div>
              </th>
              <th @click="openInfoModal('quantity')">
                <div class="flex justify-between w-full gap-1 items-center ">
                  <span>
                    Кол-во
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
                    ?
                  </span>
                </div>
              </th>
              <th @click="openInfoModal('size')">
                <div class="flex justify-between w-full gap-1 items-center">
                  <span>
                    Размер
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
                    ?
                  </span>
                </div>
              </th>
              <th @click="openInfoModal('sex')">
                <div class="flex justify-between w-full gap-1 items-center">
                  <span>
                    Пол
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
                    ?
                  </span>
                </div>
              </th>
              <th @click="openInfoModal('search')">
                <div class="flex justify-between w-full gap-1 items-center">
                  <span>
                    Поисковые запросы
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
                    ?
                  </span>
                </div>
              </th>
              <th class="min-w-40" @click="openInfoModal('adress')">
                <div class="flex justify-between w-full gap-1 items-center">
                  <span>
                    Адрес
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
                    ?
                  </span>
                </div>
              </th>
              <th @click="openInfoModal('dates')">
                <div class="flex justify-between w-full gap-1 items-center">
                  <span>
                    Даты выкупов
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
                    ?
                  </span>
                </div>
              </th>
              <th @click="openInfoModal('rules')">
                <div class="flex justify-between w-full gap-1 items-center">
                  <span>
                    Правила
                  </span>
                  <span class="rounded-lg bg-base-200 px-1 text-xs">
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
              v-for="(product, index) in products" :key="index" :product="product" :index="index" :loading="!pickpoints?.length" @rule-modal-open="ruleModalOpen" @point-modal-open="pointModalOpen"
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
      <button class="btn btn-primary btn-sm normal-case" :disabled="disabledCreateButton" @click="openChecksModal">
        {{ products.length > 1 ? `Создать
                            выкупы` : `Создать выкуп` }}
      </button>
    </div>

    <div v-if="ruleModal">
      <input id="ruleModal" type="checkbox" class="modal-toggle">
      <label for="ruleModal" class="modal modal-open modal-bottom sm:modal-middle">
        <label for="" class="modal-box relative">
          <label
            for="ruleModal"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="ruleModal = false"
          >✕</label>
          <h3 class="font-bold text-lg mb-2">Выберите нужные правила для этого выкупа</h3>
          <div v-for="(rule) of defaultRules" :key="rule.id" class="">
            <div class="label cursor-pointer flex gap-4 items-start">
              <span class="label-text">{{ rule.id }}. {{ rule.description }}</span>
              <input
                :disabled="!!store.createProducts[selectedRuleProductIndex].rules.find(item => item.category === rule.category && item.id !== rule.id) || !!store.createProducts[selectedRuleProductIndex].rules.find(item => item.id === rule?.relies)"
                type="checkbox" class="checkbox checkbox-primary"
                :checked="!!store.createProducts[selectedRuleProductIndex].rules.find(item => item.id === rule.id)"
                @change="onRuleChange($event, selectedRuleProductIndex, rule.id)"
              >
            </div>
          </div>
        </label>
      </label>
    </div>
    <dialog id="infoModal" ref="infoModal" class="modal">
      <form method="dialog" class="modal-box p-4">
        <h3 class="font-bold text-lg">
          Информация
        </h3>
        <div class="py-4 flex flex-col gap-2">
          <p v-if="infoType === 'picture'">
            <span class="font-bold">
              Изображение
            </span>
            - Увеличивайте изображение товара просто наводя на него курсором
          </p>
          <p v-if="infoType === 'price'">
            <span class="font-bold">
              Цена
            </span>
            - Цена товара указана без СПП
          </p>
          <p v-if="infoType === 'quantity'">
            <span class="font-bold">
              Количество
            </span>
            - Указывайте желаемое количество выкупов, но не более 3 штук на 1 ПВЗ в сутки
          </p>
          <p v-if="infoType === 'size'">
            <span class="font-bold">
              Размер
            </span>
            - Выберите желаемый размер товара
          </p>
          <p v-if="infoType === 'sex'">
            <span class="font-bold">
              Пол
            </span>
            - Выберите желаемый Пол для выкупов
          </p>
          <div v-if="infoType === 'search'">
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
          <p v-if="infoType === 'adress'">
            <span class="font-bold">
              Адрес
            </span>
            - Добавьте Адрес желаемого ПВЗ от куда вы будете забирать товар
          </p>
          <p v-if="infoType === 'dates'">
            <span class="font-bold">
              Даты выкупов
            </span>
            - Выберите желаемый диапазон дат и времени для выкупов
          </p>
          <p v-if="infoType === 'rules'">
            <span class="font-bold">
              Правила
            </span>
            - Используйте Правила для создания дополнительной безопасности ваших выкупов
          </p>
        </div>
        <div class="modal-action mt-0">
          <button class="btn btn-sm">
            Закрыть
          </button>
        </div>
      </form>
    </dialog>
    <BuyoutCreateChecksModal v-if="checksModal" :state="checksModal" @create="createBuyout" @close="checksModal = false" />
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
