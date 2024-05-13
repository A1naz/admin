<script setup lang="ts">
const { height, width } = useWindowSize()
const value = ref('')
const productsCountInfo = ref({
  count: 0,
  sum: 0,
})
const isCreateButtonDisabled = ref(false)
const closeCreateModalButton: any = ref(null)
const createType = ref('deliveries')
const sortDateType = ref('requireDate')
const currency = useCurrency()
const type = ref('any')
const service = ref('any')
const { $dayjs } = useNuxtApp()
const creating = ref(false)
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const createClose: any = ref(null)
import { notify } from '@kyvg/vue3-notification'
const dateSortIcon = ref('mdi-arrow-down')
const query = ref('+7')
const account = ref('+7')
const inputLoading = ref(false)
const curPage = ref(1)
const stats = ref<any>([])
const pages = ref(0)
const isPageBtnsDisabled = ref(false)
const dateRange = ref([])
const article = ref('')
const selectedMP = ref('wildberries')
const mpStore = useMPStore()
const config = useRuntimeConfig()

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Запросы скриншотов',
})

async function getStats() {
  stats.value = []
  const { data }: any = await useFetch('/api/screenshots/get', {
    method: 'GET',
    query: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      account: query.value.replace(/[\(\)\-\s]/g, ''),
      sortDateType: sortDateType.value,
      type: type.value,
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
    watch: false,
  })
  if (data.value) {
    stats.value = data.value.screenshots
  }
}

async function createRequire() {
  
  if (
    !article.value ||
    !account.value ||
    account.value.length < 10 ||
    article.value.length < 2
  ) {
    notify({
      type: 'error',
      title: 'Заполните все поля',
    })
    return
  }

  isCreateButtonDisabled.value = true
  const { data, error }: any = await useFetch('/api/screenshots/create', {
    method: 'POST',
    body: {
      account: account.value.replace(/[\(\)\-\s]/g, ''),
      typeOperation: createType.value,
      mp: selectedMP.value,
      article: article.value,
    },
    watch: false,
  })
  if (data.value) {
    notify({
      type: 'success',
      title: 'Заявка создана',
    })
    isCreateButtonDisabled.value = false
    closeCreateModalButton.value?.click()
    account.value = '+7'
    article.value = ''

    getStats()
  }
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
    })
    isCreateButtonDisabled.value = false
    closeCreateModalButton.value?.click()
  }
}

const selectedImage: any = ref('null')
const imageModalClose: any = ref(null)
function openImageModal(img: string) {
  selectedImage.value = img
  imageModalClose.value?.click()
}

function closeImageModal() {
  imageModalClose.value?.click()
}

function sortByDate(sortType: string) {
  sortDateType.value = sortType

  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getStats()
}

async function swapPage(destination: number) {
  if (destination < 0 && curPage.value <= 1) return
  if (curPage.value >= pages.value && destination > 0) {
    notify({
      type: 'error',
      title: 'Последняя страница',
    })
    return
  }
  curPage.value += destination
  isPageBtnsDisabled.value = true
  await getStats()
  isPageBtnsDisabled.value = false
}

function openCreateModal() {
  createClose.value?.click()
}

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

const findSearchQuery = async () => {
  inputLoading.value = true
  await getStats()
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

getStats()

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('запросы скриншотов')
) {
  navigateTo('/partner')
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Запросы скриншотов</h1>
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/screenshots">Запросы скриншотов</NuxtLink>
      </li>
      <!-- <li>
                    <NuxtLink to="/partner/management">Управление партнерами</NuxtLink>
                </li> -->
    </ul>
  </div>
  <div class="divider"></div>
  <div class="flex justify-between">
    <div class="flex">
      <div>
        <label>
          <input
            v-model="query"
            type="text"
            v-maska
            data-maska="+7 (###) ###-##-##"
            placeholder="Номер телефона"
            class="input input-bordered input-l mb-2 w-full"
            @input="onInput($event)"
          />
        </label>
        <span
          v-if="inputLoading"
          class="loading loading-spinner text-primary loading-large ml-4"
        />
      </div>

      <select
        class="select select-bordered w-50 ml-3"
        @change=";[(curPage = 1), getStats()]"
        v-model="type"
      >
        <option selected value="any">все типы операции</option>
        <option value="deliveries">Доставки</option>
      </select>
      <DateRangePicker
        class="w-46"
        v-model="dateRange"
        :start-date="startDate"
        @reset="dateRange = []"
      >
        <button class="btn btn-primary ml-3 min-w-2xl">
          {{
            dateRange.length > 1
              ? `${$dayjs(dateRange[0]).format('DD.MM.YYYY')} - ${$dayjs(
                  dateRange[1]
                ).format('DD.MM.YYYY')}`
              : 'Выбрать даты'
          }}
        </button>
      </DateRangePicker>
      <button
        class="btn btn-primary ml-3"
        @click=";[(curPage = 1), getStats()]"
      >
        Применить
      </button>
    </div>
    <div>
      <button
        class="btn btn-primary mr-3"
        onclick="createRequireModal.showModal()"
        :disable="isCreateButtonDisabled"
      >
        Создать запрос
      </button>

      <div class="join mr-2">
        <button
          class="join-item btn"
          @click="swapPage(-1)"
          :disabled="isPageBtnsDisabled"
        >
          «
        </button>
        <button class="join-item btn">{{ curPage }}</button>
        <button
          class="join-item btn"
          @click="swapPage(1)"
          :disabled="isPageBtnsDisabled"
        >
          »
        </button>
      </div>
    </div>
  </div>
  <div
    class="my-2 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table table-pin-rows">
      <!-- head -->
      <thead>
        <tr>
          <th>Тип операции</th>
          <th>
            <div
              @click="sortByDate('requireDate')"
              class="flex cursor-pointer"
              style="width: 100px"
            >
              Дата запроса
              <Icon
                v-if="sortDateType == 'requireDate'"
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>
            <div
              @click="sortByDate('responseDate')"
              class="flex cursor-pointer"
              style="width: 100px"
            >
              Дата ответа
              <Icon
                v-if="sortDateType == 'responseDate'"
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>Аккаунт</th>
          <th>Артикул</th>
          <th>Статус</th>
          <th class="text-center">Скриншоты</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="stat in stats" class="hover">
          <th class="overflow-x-auto text-xs">
            {{ stat.typeOperation }}
          </th>
          <th class="overflow-x-auto text-xs">
            {{ stat.requireDate.slice(0, 10) }}
          </th>
          <th class="overflow-x-auto text-xs">
            {{ stat.responseDate ? stat.responseDate.slice(0, 10) : '' }}
          </th>
          <th class="overflow-x-auto text-xs">
            {{ stat.account }}
          </th>
          <th class="overflow-x-auto text-xs">
            {{ stat.article }}
          </th>
          <th>
            {{
              stat.status == 'created'
                ? 'создан'
                : stat.status == 'rejected'
                ? 'нет доступа к аккаунту'
                : 'получен'
            }}
          </th>
          <th>
            <div class="flex max-w-lg overflow-x-auto justify-center">
              <div v-for="img in stat.screenshots">
                <img
                  :src="config.public.IMAGES_URL + img"
                  class="cursor-pointer rounded w-16 ml-1"
                  @click="
                    openImageModal(config.public.IMAGES_URL + img)
                  "
                />
              </div>
            </div>
          </th>
        </tr>
      </tbody>
    </table>
  </div>

  <dialog id="createRequireModal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg"></h3>
      <div class="flex flex-col">
        <select class="select select-bordered w-50 my-2" v-model="createType">
          <option value="deliveries">Доставки</option>
        </select>
        <select class="select select-bordered w-50 my-2" v-model="selectedMP">
          <option
            v-for="tab in mpStore.MPTabs"
            :key="tab.value"
            :value="tab.value"
          >
            {{ tab.title }}
          </option>
        </select>
        <input
          v-model="account"
          type="text"
          v-maska
          data-maska="+7 (###) ###-##-##"
          placeholder="Номер телефона"
          class="input input-bordered input-l mb-2 w-full"
        />
        <input
          v-model="article"
          type="number"
          placeholder="Артикул"
          class="input input-bordered input-l mb-2 w-full"
        />
      </div>
      <div class="flex justify-center">
        <button class="btn btn-primary mt-3 px-10" @click="createRequire" :disabled="isCreateButtonDisabled">
          Создать запрос
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button ref="closeCreateModalButton">close</button>
    </form>
  </dialog>

  <input type="checkbox" id="imageModal" class="modal-toggle" />
  <div class="modal cursor-pointer" @click="closeImageModal">
    <div class="modal-box w-fit max-w-full cursor-pointer">
      <form method="dialog">
        <label
          for="imageModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hidden"
          ref="imageModalClose"
        >
          ✕
        </label>
      </form>
      <div class="flex justify-center">
        <nuxt-img class="max-w-xl" :src="selectedImage" />
      </div>
    </div>
  </div>
  <!-- Put this part before </body> tag -->
</template>
<style scoped>
::-webkit-scrollbar {
  height: 4px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
}
</style>
