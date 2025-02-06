<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Возвраты средств клиентам',
})

const store = useMainStore()

if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('возвраты средств клиентам')
) {
  navigateTo('/partner')
}

const currency = useCurrency()

const isModalOpen = ref(false)
const { height, width } = useWindowSize()
const { upload, getPublicUrl } = useS3Object()
const handleOperationSumm = ref()
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
const selectedUser: any = ref({
  username: '',
})
const selectedScreenshot: any = ref('dialog')
const refundType = ref('Возврат по вине клиента')
const comment = ref('')
const selectedOperation: any = ref('')
const selectedOperationMongoId: any = ref('')
const inputLoading = ref(false)
const curPage = ref(1)
const stats = ref<any>([])
const pages = ref(10000)
const isPageBtnsDisabled = ref(false)
const dateRange = ref([])
const loadingIndex = ref(false)
const screenshotInput: any = ref(null)
const selectUserClose: any = ref(null)
const users = ref<any>([])
const refundsOperationsModal = ref()
const isCreateButtonDisabled = ref(false)
const phoneNumber = ref('')
const selectedTabOption = ref('')

const config = useRuntimeConfig()

const screenshot = ref({
  url: 'null',
  public: 'null',
})
const accountScreenshot = ref({
  url: 'null',
  public: 'null',
})
const paymentOperations = ref<any>([])

const selectedPaymentOperationsCount = computed(() => {
  let count = 0
  paymentOperations.value.forEach((el: any) => {
    if (el.selected) {
      count++
    }
  })
  return count
})

const allPaymentOperationsSumm = computed(() => {
  let summ = 0
  paymentOperations.value.forEach((el: any) => {
    summ += el.summ
  })
  return summ
})
const selectedPaymentOperationsSumm = computed(() => {
  let summ = 0
  paymentOperations.value.forEach((el: any) => {
    if (el.selected) {
      summ += el.summ
    }
  })
  return summ
})

async function getStats() {
  stats.value = []
  const { data }: any = await useFetch('/api/refunds/get', {
    method: 'GET',
    query: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      account: query.value,
      sortDateType: sortDateType.value,
      type: type.value,
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
    watch: false,
  })
  if (data.value) {
    stats.value = data.value
  }
}

async function uploadToS3(event: Event, screen: string = 'dialog') {
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

    if (selectedScreenshot.value == 'account') {
      accountScreenshot.value = {
        url: publicUrl,
        public: publicUrl,
      }
    } else {
      screenshot.value = {
        url: publicUrl,
        public: publicUrl,
      }
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
    watch: false,
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

function openFileInput(screenType: string = 'dialog') {
  selectedScreenshot.value = screenType
  screenshotInput.value?.click()
}

async function createRefundRequest() {
  isCreateButtonDisabled.value = true

  if (
    !selectedOperationMongoId.value ||
    (selectedPaymentOperationsCount.value < 1 &&
      !handleOperationSumm.value &&
      handleOperationSumm.value < 1)
  ) {
    notify({
      type: 'error',
      title: 'Нужно выбрать хотя бы одну операцию или ввести сумму вручную',
    })
    isCreateButtonDisabled.value = false
    return
  }

  const selectedPaymentOperations = paymentOperations.value.filter(
    (el: any) => el.selected
  )

  const { data, error }: any = await useFetch('/api/refunds/createRequest', {
    watch: false,
    method: 'POST',
    body: {
      phoneNumber: phoneNumber.value.replace(/[\(\)\-\s]/g, ''),
      handleOperationSumm: handleOperationSumm.value,
      userId: selectedUser.value._id,
      screenshot: screenshot.value.public.replace(config.public.IMAGES_URL, ''),
      accountScreenshot: accountScreenshot.value.public.replace(
        config.public.IMAGES_URL,
        ''
      ),
      mainOperation: selectedOperationMongoId.value,
      paymentOperations: selectedPaymentOperations,
      mainOperationSumm: allPaymentOperationsSumm.value,
      selectedPaymentOperationsSumm: selectedPaymentOperationsSumm.value,
      comment: comment.value,
      refundType: refundType.value,
      mainOperationType: selectedTabOption.value,
    },
  })
  if (data.value) {
    if (data.value.status == 'ok') {
      notify({
        type: 'success',
        title: data.value.message,
      })

      location.reload()
    } else {
      isCreateButtonDisabled.value = false
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

function openUsersSelectModal() {
  isModalOpen.value = !isModalOpen.value
}

function selectUser(user: any) {
  selectedUser.value = user

  isModalOpen.value = false
  selectedOperation.value = ''
  paymentOperations.value = []

  userQuery.value = ''
  users.value = []
}

function openRefundsModal() {
  refundsOperationsModal.value?.getInfo()
  store.refundsOperationsModal = true
}

function openRefundsPaymentModal() {
  store.refundsPaymentOperationsModal = true
}

async function selectOperation(
  operationId: string,
  operationMongoId: string,
  tabOption: string
) {
  selectedTabOption.value = tabOption
  selectedOperation.value = operationId
  selectedOperationMongoId.value = operationMongoId

  const { data, error } = await useFetch('/api/refunds/paymentOperations', {
    method: 'GET',
    query: {
      operationId,
    },
    watch: false,
  })
  if (data.value) {
    paymentOperations.value = data.value
  } else {
    notify({
      type: 'error',
      title: 'Произошла ошибка',
    })
  }
}

const mpStore = useMPStore()

function changeMP(event: any) {
  if (event.target.value !== 'wildberries') {
    navigateTo('/refunds/' + event.target.value)
  }
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">
    Возвраты средств клиентам Wildberries
  </h1>
  <div class="card p-fluid"></div>
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
      <select
        class="select select-bordered max-w-xs ml-2 mb-2"
        @change="($event) => changeMP($event)"
      >
        <option
          v-for="tab in mpStore.MPTabs"
          :key="tab.value"
          :value="tab.value"
          :selected="tab.value == 'wildberries'"
        >
          {{ tab.title }}
        </option>
      </select>
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
          <th>ник менеджера</th>
          <th>ник пользователя</th>
          <th>номер телефона аккаунта</th>
          <th>основная операция</th>
          <th>тип операции</th>
          <th>тип возврата</th>
          <th>общая сумма</th>
          <th>сумма доп. операций</th>
          <th>ручная сумма</th>
          <th>основание операции</th>
          <th>статус поиска</th>

          <th>
            <div @click="sortByDate()" class="flex cursor-pointer">
              Дата и время создания
              <Icon
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>подтверждение</th>
          <th>комментарий отмены</th>
          <!-- <th class="text-center">скриншот запроса</th>
          <th class="text-center">скриншот аккаунта</th> -->
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="stat in stats" class="hover" :key="stat.id">
          <th class="text-xs overflow-x-auto">
            {{ stat.adminUsername }}
          </th>
          <th class="text-xs overflow-x-auto">
            {{ stat.userUsername }}
          </th>
          <th class="text-xs overflow-x-auto">
            {{ stat.phoneNumber }}
          </th>
          <th class="text-xs overflow-x-auto">{{ stat.mainOperation }}</th>
          <th class="text-xs overflow-x-auto">{{ stat.mainOperationType }}</th>
          <th class="text-xs overflow-x-auto">{{ stat.refundType }}</th>
          <!-- <th>
            <div
              v-for="selectedPaymentOperation in stat.selectedPaymentOperations"
            >
              {{ selectedPaymentOperation }}
            </div>
          </th> -->

          <th>{{ currency.format(stat.mainOperationSumm) }}</th>
          <th>{{ currency.format(stat.selectedPaymentOperationsSumm) }}</th>
          <th>
            {{
              stat.handleOperationSumm
                ? currency.format(stat.handleOperationSumm)
                : ''
            }}
          </th>
          <th style="min-width: 250px">
            {{ stat.comment }}
          </th>
          <th>
            {{
              stat.status == 'created'
                ? 'создано'
                : stat.status == 'completed'
                ? 'завершено'
                : stat.status == 'accepted'
                ? 'завершено'
                : stat.status == 'fundWaiting'
                ? 'ожидание возврата средств'
                : 'отменено'
            }}
          </th>
          <th>{{ defaultDate(stat.requestDate) }}</th>
          <th>{{ stat.acception }}</th>
          <th>
            <div
              style="max-width: 250px; max-height: 150px"
              class="overflow-y-auto"
            >
              {{ stat.cancelationComment }}
            </div>
          </th>
          <!-- <th>
            <div class="flex max-w-lg overflow-x-auto justify-center">
              <div>
                <img
                  :src="config.public.IMAGES_URL + stat.screenshot"
                  class="cursor-pointer rounded w-24 ml-1"
                  @click="
                    openImageModal(config.public.IMAGES_URL + stat.screenshot)
                  "
                />
              </div>
            </div>
          </th> -->
          <!-- <th>
            <div class="flex max-w-lg overflow-x-auto justify-center">
              <div>
                <img
                  :src="config.public.IMAGES_URL + stat.accountScreenshot"
                  class="cursor-pointer rounded w-24 ml-1"
                  @click="
                    openImageModal(
                      config.public.IMAGES_URL + stat.accountScreenshot
                    )
                  "
                />
              </div>
            </div>
          </th> -->
        </tr>
      </tbody>
    </table>
  </div>

  <input type="checkbox" id="createRequireModal" class="modal-toggle" />
  <div id="createRequireModal" class="modal">
    <div class="modal-box max-w-2xl">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="closeCreateModalButton.click()"
      >
        ✕
      </button>

      <div class="flex flex-col mt-3">
        <button class="btn max-w-xl my-1 w-xl" @click="openUsersSelectModal()">
          {{
            selectedUser.username == ''
              ? 'Укажите клиента'
              : selectedUser.username
          }}
        </button>
        <button
          class="btn max-w-xl my-1 w-xl"
          @click="openRefundsModal"
          :disabled="selectedUser.username == ''"
        >
          {{
            selectedOperation == ''
              ? 'Выберите основную операцию для возврата'
              : 'Операция выбрана'
          }}
        </button>
        <div class="stats -mb-2">
          <div class="stat flex justify-between">
            <div class="stat-title text-center font-bold">
              Сумма основной операции
            </div>
            <div class="stat-value text-2xl -mt-0.5 text-center">
              {{ currency.format(allPaymentOperationsSumm) }}
            </div>
          </div>
        </div>
        <button
          class="btn max-w-xl my-1 w-xl"
          @click="openRefundsPaymentModal"
          :disabled="selectedOperation == ''"
        >
          {{
            selectedPaymentOperationsCount < 1
              ? 'Выберите дополнительные операции для возврата'
              : `Выбрано дополнительных
            операций: ${selectedPaymentOperationsCount}`
          }}
        </button>

        <div class="stats -mb-2">
          <div class="stat flex justify-between">
            <div class="stat-title text-center font-bold">
              Сумма дополнительных операции
            </div>
            <div class="stat-value text-2xl -mt-0.5 text-center">
              {{ currency.format(selectedPaymentOperationsSumm) }}
            </div>
          </div>
        </div>
        <div
          v-if="
            selectedTabOption == 'buyouts' &&
            refundType == 'Возврат по вине клиента'
          "
          class="divider"
        >
          или введите сумму для возврата от руки
        </div>

        <!-- <input
          v-if="
            selectedTabOption == 'buyouts' &&
            refundType == 'Возврат по вине клиента'
          "
          v-model="handleOperationSumm"
          placeholder="Сумма возврата"
          class="input input-bordered w-full mr-3"
        /> -->
        <PaymentInput
          v-if="
            selectedTabOption == 'buyouts' &&
            refundType == 'Возврат по вине клиента'
          "
          v-model="handleOperationSumm"
        />
        <div class="divider my-2" v-if="selectedTabOption == 'buyouts'" />
        <select
          v-if="selectedTabOption == 'buyouts'"
          v-model="refundType"
          class="select select-bordered w-full mb-2 text-[16px]"
        >
          <option disabled>Тип возврата за товар</option>
          <option value="Возврат по вине клиента">
            Возврат по вине клиента
          </option>
          <option value="Другой возврат">Другой возврат</option>
        </select>
        <input
          v-model="comment"
          type="text"
          placeholder="Основание операции"
          class="input input-bordered w-full mr-3 mb-2"
        />
        <input
          v-if="selectedTabOption == 'buyouts'"
          v-model="phoneNumber"
          type="text"
          v-maska
          data-maska="+7 (###) ###-##-##"
          placeholder="Номер телефона аккаунта"
          class="input input-bordered input-l mb-2 w-full"
        />
      </div>
      <div class="flex flex-col justify-center gap-2"></div>

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
          :disabled="isCreateButtonDisabled"
          @click="createRefundRequest"
        >
          Отправить на проверку
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <label
        class="cursor-pointer"
        for="createRequireModal"
        ref="closeCreateModalButton"
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

  <!-- <input type="checkbox" id="selectUser" :checked="true" class="modal-toggle" /> -->
  <div
    class="modal cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="isModalOpen = false"
  >
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="isModalOpen = false"
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
                <th>username</th>
                <th>организация</th>
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
                    {{ user.organization }}
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

  <div>
    <RefundsOperationsModal
      :selected-operation="selectedOperation"
      :selected-user="selectedUser"
      @select-operation="selectOperation"
      ref="refundsOperationsModal"
    />
    <RefundsPaymentOperationsModal
      :payment-operations="paymentOperations"
      :refundType="refundType"
    />
  </div>

  <!-- Put this part before </body> tag -->
</template>
<style scoped>
::-webkit-scrollbar {
  height: 4px;
  width: 10px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 2px;
}
</style>
