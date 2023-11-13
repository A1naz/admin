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
const userQuery = ref('')
const account = ref('+7')
const client: any = ref({
  username: '',
})
const transaction = ref('')
const transactionStatus = ref('notFount')
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
const selectUserClose: any = ref(null)
const now = new Date()
const date = ref(now)
const users = ref<any>([])
const phoneNumber = ref('+7')

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

async function getUsers(searchValue: string = '') {
  const { data }: any = await useFetch('/api/user/getUsers', {
    method: 'GET',
    params: {
      page: 1,
      searchValue,
    },
  })

  users.value = data.value.users
}

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getUsers(userQuery.value)
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
  if (transaction.value.length < 1) {
    notify({
      type: 'error',
      title: 'Введите сумму транзакции',
    })
    return
  }

  if (phoneNumber.value.length < 10) {
    notify({
      type: 'error',
      title: 'Введите номер телефона',
    })
    return
  }

  if (client.value.username.length < 2) {
    notify({
      type: 'error',
      title: 'Выберите клиента',
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
        client: client.value._id,
        transaction: transaction.value,
        date: date.value,
        phoneNumber: phoneNumber.value,
      },
    }
  )

  if (data.value) {
    const intervalId = setInterval(async () => {
      const response = await getSearchStatus(data.value.id)
      if (response === 'found' || response === 'notFount') {
        transactionStatus.value = response

        isSearchInputDisabled.value = false
        if (response === 'notFount') {
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
if (transactionStatus.value !== 'found') {
  notify({
    type: 'error',
    title: 'Сначала необходимо выполнить поиск транзакцию',
  })

  return
}


  if (screenshot.value.public === 'null') {
    notify({
      type: 'error',
      title: 'Нужно загрузить скриншот',
    })
    return
  }
  if (
    transaction.value.length < 1 ||
    transactionNumber.value.length < 5 ||
    client.value.username.length < 2
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
        client: client.value._id,
        date: date.value,
        phoneNumber: phoneNumber.value,
      },
    }
  )
  if (data.value) {
    if (data.value.status == 'ok') {
      notify({
        type: 'success',
        title: data.value.message,
      })
      
      getStats()
      closeCreateModalButton.value?.click()
      transactionStatus.value = 'notFount'
      client.value = { username: '' }
      transaction.value = ''
      transactionNumber.value = ''
      searchBtnText.value = 'Поиск'
      screenshot.value = {
        url: '',
        public: '',
      }
    } else {
      notify({
        type: 'error',
        title: data.value.message,
      })
    }
  }

  if (error.value) {
    notify({
      type: 'error',
      title: error.value.data.message,
    })
  }
}

function resetStatus() {
  transactionStatus.value = 'notFount'
  isSearchBtnDisabled.value = false
  searchBtnText.value = 'Поиск'
}

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('ошибки финансовых операции')
) {
  navigateTo('/partner')
}

function openUsersSelectModal() {
  selectUserClose.value?.click()
}

function selectUser(user: any) {
  client.value = user
  selectUserClose.value?.click()
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Ошибки финансовых операции</h1>
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
      <label class="btn btn-primary mr-3" for="createRequireModal">
        Создать запрос
      </label>

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
              Дата и время создания
              <Icon
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>Дата и время из чека</th>
          <th>номер операции из чека</th>
          <th>подтверждение</th>
          <th>статус заявки</th>
          <th class="text-center">скриншот</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="stat in stats" class="hover">
          <th class="text-xs overflow-x-auto" style="max-width: 150px">
            {{ stat.adminUserUuid }}
          </th>
          <th class="text-xs overflow-x-auto" style="max-width: 150px">
            {{ stat.clientUuid }}
          </th>
          <th>{{ stat.summ }}</th>
          <th>{{ defaultDate(stat.requestDate) }}</th>
          <th>{{ defaultDate(stat.transactionDate) }}</th>
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

  <input type="checkbox" id="createRequireModal" class="modal-toggle" />
  <div id="createRequireModal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg"></h3>
      <div class="flex flex-col">
        <!-- <input
          v-model="client"
          type="text"
          placeholder="Укажите клиента"
          class="input input-bordered input-l mb-2"
        /> -->
        <button class="btn max-w-xl my-1 w-xl" @click="openUsersSelectModal">
          {{ client.username == '' ? 'Выбрать клиента' : client.username }}
        </button>
        <div>
          <div class="relative w-full p-2 mb-2 input input-bordered rounded-lg">
            <div class="absolute left-3 bottom-3">
              {{
                date === now
                  ? 'Установите дату и время (как в чеке)'
                  : defaultDate(date)
              }}
            </div>
            <div class="right-2" style="z-index: 9999">
              <DatePicker :min-date="null" v-model="date" />
            </div>
          </div>
        </div>
        <input
          v-model="phoneNumber"
          @input="resetStatus"
          type="text"
          placeholder="Укажите номер телефона (точно как в чеке)"
          class="input input-bordered input-l mb-2 w-full"
        />

        <div class="flex">
          <label class="w-full">
            <input
              v-model="transaction"
              @input="resetStatus"
              type="number"
              placeholder="Сумма транзакции (точно как в чеке)"
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
      <label for="createRequireModal" ref="closeCreateModalButton">close</label>
    </form>
  </div>

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

  <input type="checkbox" id="selectUser" class="modal-toggle" />
  <div class="modal cursor-pointer" @click="openUsersSelectModal">
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectUser"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          ref="selectUserClose"
        >
          ✕
        </label>
      </form>

      <div>
        <div class="justify-between flex">
          <div>
            <label
              ><input
                v-model="userQuery"
                type="text"
                placeholder="Введите id или username или email"
                class="input input-bordered input-l ml-4 w-80"
                @input="onInput($event)"
              />
            </label>
            <span
              v-if="inputLoading"
              class="loading loading-spinner text-primary loading-large ml-4"
            />
          </div>
        </div>

        <div
          class="my-2 mx-2 overflow-y-auto"
          :style="{ 'max-height': 500 + 'px' }"
        >
          <table class="table my-3">
            <!-- head -->
            <thead>
              <tr>
                <th>id</th>
                <th>username</th>
                <th>email</th>
                <th>Выбрать</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover" v-for="user in users" :key="user.uuid">
                <td style="max-width: 130px">{{ user.uuid }}</td>
                <td style="max-width: 150px">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.username }}
                  </div>
                </td>
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.email }}
                  </div>
                </td>
                <td style="max-width: 20px">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="selectUser(user)"
                  >
                    Выбрать
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-action"></div>
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
