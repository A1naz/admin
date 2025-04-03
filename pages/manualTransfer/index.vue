<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Ручные пополнения средств',
})

const { height, width } = useWindowSize()
const { upload, getPublicUrl } = useS3Object()

const closeCreateModalButton: any = ref(null)
const sortDateType = ref('requireDate')
const type = ref('any')
const { $dayjs } = useNuxtApp()
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const createClose: any = ref(null)
import { notify } from '@kyvg/vue3-notification'
const dateSortIcon = ref('mdi-arrow-down')
const query = ref('+7')
const userQuery = ref('')
const account = ref('+7')
const clientPC = ref(false)
const selectedUser: any = ref({
  username: '',
})

const mpStore = useMPStore()

const userBank = ref('Alfabank')
const userIP = ref('BalashovIP')
const repaymentType = ref('withoutNDS')
const operationNumber = ref('')
const fileInput = ref()
const inputLoading = ref(false)
const curPage = ref(1)
const stats = ref<any>([])
const pages = ref(0)
const isPageBtnsDisabled = ref(false)
const dateRange = ref([])
const loadingIndex = ref(false)
const screenshotInput: any = ref(null)
const isSearchInputDisabled = ref(false)
const selectUserClose: any = ref(null)
const now = new Date()
const date = ref(now)
const users = ref<any>([])
const phoneNumber = ref('+7')
const summ = ref()
const config = useRuntimeConfig()

const screenshot = ref({
  url: 'null',
  public: 'null',
})

async function getStats() {
  stats.value = []
  const { data }: any = await useFetch('/api/manualTransfer/get', {
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
    stats.value = data.value.balanceTransferRequest
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
  if (data.value) {
    const publicUrl: any = await getS3PublicUrl(data.value[0].key)

    screenshot.value = {
      url: publicUrl,
      public: publicUrl,
    }
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
  //@ts-ignore
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

async function createBalanceTransferRequest() {
  if (screenshot.value.public === 'null') {
    notify({
      type: 'error',
      title: 'Нужно загрузить скриншот',
    })
    return
  }

  const { data, error }: any = await useFetch(
    '/api/manualTransfer/createRequest',
    {
      watch: false,
      method: 'POST',
      body: {
        userId: selectedUser.value._id,
        screenshot: screenshot.value.public.replace(
          config.public.IMAGES_URL,
          ''
        ),
        summ: Number(summ.value),
        operationNumber: operationNumber.value,
        operationDate: date.value,
        clientPC: clientPC.value,
        bank: userBank.value,
        userIP: userIP.value,
        repaymentType: repaymentType.value,
      },
    }
  )
  if (data.value) {
    if (data.value.status == 'ok') {
      notify({
        type: 'success',
        title: data.value.message,
      })
      operationNumber.value = ''
      closeCreateModalButton.value?.click()
      summ.value = 100
      screenshot.value = {
        url: 'null',
        public: 'null',
      }
      getStats()
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

const store = useMainStore()
if (!store.client.mainAdmin) {
  navigateTo('/partner')
}

function openUsersSelectModal() {
  selectUserClose.value?.click()
}

function selectUser(user: any) {
  selectedUser.value = user

  selectUserClose.value?.click()

  userQuery.value = ''
  users.value = []
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Ручные пополнения средств</h1>
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/manualTransfer"> Ручные пополнения средств</NuxtLink>
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
          <th>Организация</th>
          <th>Пользователь</th>
          <th>№ операции</th>
          <th>Сумма</th>
          <th>Статус</th>
          <th>Тип</th>

          <th>
            <div @click="sortByDate()" class="flex cursor-pointer">
              Дата заявки
              <Icon
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>Организация</th>
          <th>Банк</th>
          <th class="text-center">Скриншот</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="stat in stats" class="hover" :key="stat._id">
          <th class="text-xs overflow-x-auto">
            {{ stat.organization }}
          </th>
          <th class="text-xs overflow-x-auto">
            {{ stat.username }}
          </th>
          <th class="text-xs overflow-x-auto">{{ stat.operationNumber }}</th>
          <th>{{ stat.summ }}</th>

          <th>
            {{
              stat.status == 'created'
                ? 'создано'
                : stat.status == 'completed'
                ? 'завершено'
                : stat.status == 'accepted'
                ? 'завершено'
                : 'отменено'
            }}
          </th>
          <th>
            {{
              stat.type && stat.type == 'WithNDS5'
                ? 'С НДС 5%'
                : stat.type && stat.type == 'WithNDS7'
                ? 'С НДС 7%'
                : 'Без НДС'
            }}
          </th>
          <th>{{ defaultDate(stat.createdAt) }}</th>
          <!-- <th>{{ stat.acception }}</th> -->
          <th>{{ stat.userIP }}</th>
          <th>{{ stat.bank }}</th>
          <th>
            <div class="flex max-w-lg overflow-x-auto justify-center">
              <div>
                <img
                  :src="
                    stat.screenshot.includes('ozonmpportal.hb.vkcs.cloud')
                      ? stat.screenshot
                      : config.public.IMAGES_URL + stat.screenshot
                  "
                  class="cursor-pointer rounded w-24 ml-1"
                  @click="
                    openImageModal(
                      stat.screenshot.includes('ozonmpportal.hb.vkcs.cloud')
                        ? stat.screenshot
                        : config.public.IMAGES_URL + stat.screenshot
                    )
                  "
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
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="closeCreateModalButton.click()"
      >
        ✕
      </button>

      <div class="flex flex-col mt-3">
        <!-- <input
          v-model="client"
          type="text"
          placeholder="Укажите клиента"
          class="input input-bordered input-l mb-2"
        /> -->

        <button class="btn max-w-xl my-1 w-xl" @click="openUsersSelectModal()">
          {{
            selectedUser.username == ''
              ? 'Укажите клиента'
              : selectedUser.username
          }}
        </button>
        <!-- <div>
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
        </div> -->
        <label class="w-full">
          <!-- <input
            v-model="summ"
            type="number"
            placeholder="Сумма перевода"
            class="input w-full input-bordered input-l mb-1"
            :disabled="isSearchInputDisabled"
          /> -->
          <PaymentInput v-model="summ" />
        </label>
        <label class="w-full">
          <input
            v-model="operationNumber"
            type="number"
            placeholder="Номер операции"
            class="input w-full input-bordered input-l mb-1"
          />
        </label>
        <label class="w-full">
          <select
            v-model="repaymentType"
            class="select select-bordered w-full mb-1"
          >
            <option disabled>Тип пополнения</option>
            <option value="withoutNDS">Без НДС</option>
            <option value="WithNDS5">С НДС 5%</option>
            <option value="WithNDS7">С НДС 7%</option>
          </select>
        </label>
        <label class="w-full">
          <select v-model="userIP" class="select select-bordered w-full mb-1">
            <option disabled>ИП клиента</option>
            <option value="BalashovIP">BalashovIP</option>
            <option value="BalIP">BalIP</option>
          </select>
        </label>
        <label class="w-full">
          <select class="select select-bordered w-full mb-1" v-model="userBank">
            <option disabled>Банк клента</option>
            <option value="PSB">PSB</option>
            <option value="Sber">Sber</option>
            <option value="TBank">TBank</option>
          </select>
        </label>
      </div>

      <div class="text-center font-bold mt-1 mb-3">
        Скриншот чека операции клиента
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
            @change="(e) => uploadToS3(e)"
          />
        </div>
      </ClientOnly>

      <div class="flex justify-center">
        <button
          class="btn btn-primary mt-3 px-10"
          @click="createBalanceTransferRequest"
        >
          Отправить на проверку
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <label
        for="createRequireModal"
        ref="closeCreateModalButton"
        class="cursor-pointer"
        >close</label
      >
    </form>
  </div>
  <!-- ==================================================================== -->
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
                placeholder="id, username, email, организация"
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
                <th>Организация</th>
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
                    {{
                      user.organization
                        ? user.organization
                        : user.username + '(Физ. лицо)'
                    }}
                  </div>
                </td>
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
