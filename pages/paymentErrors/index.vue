<script setup lang="ts">
const { height, width } = useWindowSize()
const value = ref('')
const productsCountInfo = ref({
  count: 0,
  sum: 0,
})
const { upload, getPublicUrl, remove } = useS3Object()
const isCreateButtonDisabled = ref(false)
const searchBtnText = ref('Поиск')
const closeCreateModalButton: any = ref(null)
const createType = ref('deliveries')
const sortDateType = ref('requireDate')
const currency = useCurrency()
const type = ref('any')
const service = ref('any')
const { $dayjs } = useNuxtApp()
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const createClose: any = ref(null)
import { notify } from '@kyvg/vue3-notification'
const dateSortIcon = ref('mdi-arrow-down')
const query = ref('+7')
const account = ref('+7')
const client = ref('')
const transaction = ref('')
const transactionStatus = ref('notFound')
const fileInput = ref()
const url = ref('')
const transactionNumber = ref('')
const inputLoading = ref(false)
const searchTransactionLoading = ref(false)
const curPage = ref(1)
const stats = ref<any>([])
const pages = ref(0)
const isPageBtnsDisabled = ref(false)
const dateRange = ref([])
const loadingIndex = ref(false)
const screenshotInput: any = ref(null)
const isSearchBtnDisabled = ref(false)
const isSearchInputDisabled = ref(false)

const screenshot = ref({
  url: 'null',
  public: 'null',
})

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Ошибки финансовых операций',
})

async function getStats() {
  stats.value = []
  const { data }: any = await useFetch('/api/paymentErrors/get', {
    method: 'GET',
    query: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      account: query.value,
      sortDateType: sortDateType.value,
      type: type.value,
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
  })
  if (data.value) {
    stats.value = data.value.transactionRequests
  }
}

async function uploadToS3(event: Event) {
  loadingIndex.value = true
  const fileList = (event.target! as HTMLInputElement).files
  const files = Array.from(fileList!)
  if (!files) return
  const { data, error } = await upload({
    files,
    url: null,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: 'Не удалось загрузить фото',
      type: 'error',
      duration: 3000,
    })
  }
  if (data.value)
    screenshot.value = {
      url: data.value[0].url,
      public: getPublicUrl(data.value[0].url),
    }

  loadingIndex.value = false
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

function sortByDate() {
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
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getStats()
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

getStats()

function openFileInput() {
  screenshotInput.value?.click()
}

async function getSearchStatus(id: any) {
  const { data, error }: any = await useFetch('/api/paymentErrors/getStatus', {
    method: 'GET',
    params: {
      id: id,
    },
  })
  if (data.value) {
    return data.value.status
  }
}

async function searchTransaction() {
  if (transaction.value.length < 5) {
    notify({
      type: 'error',
      title: 'Введите дату и время транзакции',
    })
    return
  }

  searchTransactionLoading.value = true
  isSearchInputDisabled.value = true
  isSearchBtnDisabled.value = true

  const { data, error }: any = await useFetch(
    '/api/paymentErrors/createSearch',
    {
      method: 'POST',
      body: {
        transaction: transaction.value,
      },
    }
  )

  if (data.value) {
    const intervalId = setInterval(async () => {
      const response = await getSearchStatus(data.value.id)
      if (response === 'found' || response === 'notFound') {
        transactionStatus.value = response

        isSearchInputDisabled.value = false
        if (response === 'notFound') {
          isSearchBtnDisabled.value = false
        }

        searchBtnText.value = response === 'found' ? 'Найдена' : 'Поиск'
        searchTransactionLoading.value = false
        notify({
          type: response === 'found' ? 'success' : 'error',
          title:
            response === 'found'
              ? 'Транзакция успешно найдена'
              : 'Транзакция не найдена',
        })
        clearInterval(intervalId)
      }
    }, 3000)
  }
}

async function createTransactionRequest() {
  if (screenshot.value.public === 'null') {
    notify({
      type: 'error',
      title: 'Нужно загрузить скриншот',
    })
    return
  }
  if (
    transaction.value.length < 5 ||
    transactionNumber.value.length < 5 ||
    client.value.length < 2
  ) {
    notify({
      type: 'error',
      title: 'Заполните все данные',
    })
    return
  }

  const { data, error }: any = await useFetch(
    '/api/paymentErrors/createRequest',
    {
      method: 'POST',
      body: {
        screenshot: screenshot.value.public,
        transaction: transaction.value,
        transactionNumber: transactionNumber.value,
        client: client.value,
      },
    }
  )
  if (data.value) {
    if (data.value.status == 'ok') {
      notify({
        type: 'success',
        title: data.value.message,
      })

      closeCreateModalButton.value?.click()
      transactionStatus.value = 'notFound'
      client.value = ''
      transaction.value = ''
      transactionNumber.value = ''
      searchBtnText.value = 'Поиск'
      screenshot.value = {
        url: '',
        public: '',
      }
      await getStats()
    } else {
      notify({
        type: 'error',
        title: data.value.message,
      })
    }
  }
}

function resetStatus() {
  transactionStatus.value = 'notFound'
  isSearchBtnDisabled.value = false
  searchBtnText.value = 'Поиск'
}

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('ошибки финаносвых операции')
) {
  navigateTo('/partner')
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Ошибки финаносвых операции</h1>
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/paymentErrors">Ошибки финансовых операции</NuxtLink>
      </li>
      <!-- <li>
                    <NuxtLink to="/partner/management">Управление партнерами</NuxtLink>
                </li> -->
    </ul>
  </div>
  <div class="divider"></div>
  <div class="flex justify-between">
    <div class="flex">
      <!-- <div>
        <label
          ><input
            v-model="query"
            type="text"
            placeholder="Номер телефона"
            class="input input-bordered input-l ml-4"
            @input="onInput($event)"
          />
        </label>
        <span
          v-if="inputLoading"
          class="loading loading-spinner text-primary loading-large ml-4"
        />
      </div> -->

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
          <th>менеджер</th>
          <th>клиент</th>
          <th>сумма</th>
          <th>
            <div @click="sortByDate()" class="flex cursor-pointer">
              Дата
              <Icon
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>номер операции из чека</th>
          <th>подтверждение</th>
          <th>статус заявки</th>
          <th class="text-center">скриншот</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="stat in stats" class="hover">
          <th>{{ stat.adminUser }}</th>
          <th>{{ stat.client }}</th>
          <th>{{ stat.sum }}</th>
          <th>{{ stat.requestDate }}</th>
          <th>{{ stat.transactionNumber }}</th>
          <th>{{ stat.acception }}</th>
          <th>{{ stat.status }}</th>

          <th>
            <div class="flex max-w-lg overflow-x-auto justify-center">
              <div>
                <img
                  :src="stat.screenshot"
                  class="cursor-pointer rounded w-16 ml-1"
                  @click="openImageModal(stat.screenshot)"
                />
              </div>
            </div>
          </th>
        </tr>
      </tbody>
    </table>
  </div>

  <dialog id="createRequireModal" class="modal">
    <div class="modal-box w-6/12 max-w-xl">
      <h3 class="font-bold text-lg"></h3>
      <div class="flex flex-col">
        <input
          v-model="client"
          type="text"
          placeholder="Укажите клиента"
          class="input input-bordered input-l mb-2"
        />

        <div class="flex">
          <label class="w-full">
            <input
              v-model="transaction"
              @input="resetStatus"
              type="text"
              placeholder="Сумма, дата и время транзакции (точно как в чеке)"
              class="input w-full input-bordered input-l mb-1"
              :disabled="isSearchInputDisabled"
            />
          </label>
          <button
            :disabled="isSearchBtnDisabled"
            class="btn btn-primary ml-1"
            @click="searchTransaction"
          >
            {{ searchBtnText }}
          </button>
          <span
            v-if="searchTransactionLoading"
            class="loading loading-spinner"
          ></span>
        </div>
      </div>

      <div v-if="transactionStatus == 'found'">
        <input
          v-model="transactionNumber"
          type="text"
          placeholder="Укажите номер операции (точно как в чеке)"
          class="input input-bordered input-l mb-2 w-full"
        />
        <div class="text-center font-bold mt-1 mb-3">
          Приложите скриншот чека операции клиента
        </div>
        <div class="flex justify-center" style="min-height: 200px">
          <div
            @click="openFileInput"
            :class="`cursor-pointer flex justify-center border-neutral ${
              screenshot.public === 'null' ? 'border-2' : ''
            } rounded-lg`"
            style="width: 200px; height: 300px"
          >
            <nuxt-img
              v-if="screenshot.public !== 'null'"
              class="max-w-lg rounded-lg my-2 px-1"
              style="display: block; max-height: 300px"
              :src="screenshot.public"
            />
            <span
              v-if="loadingIndex && screenshot.public === 'null'"
              class="loading loading-spinner text-primary absolute mt-32"
            />
            <IconCSS
              style="max-height: 300px"
              v-show="screenshot.public === 'null'"
              class="mt-28"
              :name="
                loadingIndex == true
                  ? ''
                  : 'material-symbols:add-photo-alternate-outline'
              "
              size="70"
            />
          </div>
        </div>
        <ClientOnly>
          <div>
            <input
              type="file"
              accept="image/png, image/gif, image/jpeg"
              ref="screenshotInput"
              class="hidden"
              @change="(e: Event) => uploadToS3(e)"
            />
          </div>
        </ClientOnly>
      </div>

      <div class="flex justify-center">
        <button
          class="btn btn-primary mt-3 px-10"
          @click="createTransactionRequest"
        >
          Отправить на проверку
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
