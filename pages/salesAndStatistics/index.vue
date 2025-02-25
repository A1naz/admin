<script setup lang="ts">
const { height, width } = useWindowSize()
const value = ref('')
const mpStore = useMPStore()
const isAllUsersSelected = computed(() => {
  return selectedUsers.value.length > 1 ? false : true
})
const productsCountInfo = ref({
  count: 0,
  sum: 0,
})
const loading = ref(false)
const isExportBtnDisabled = ref(false)
const currency = useCurrency()
const type = ref('any')
const faceType = ref('any')
const service = ref('any')
const articleQuery = ref('')
const productName = ref('')
const { $dayjs } = useNuxtApp()
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const selectUsersClose: any = ref(null)
import { notify } from '@kyvg/vue3-notification'
const dateSortIcon = ref('mdi-arrow-down')
const items = ref<any>([
  { label: 'Item 1', value: 'Item 1' },
  { label: 'Item 2', value: 'Item 2' },
  { label: 'Item 3', value: 'Item 3' },
])
const query = ref('')
const users = ref<any>([])
const inputLoading = ref(false)
const curPage = ref(1)
const stats = ref<any>([])
const statsCount = ref(0)
const elPerPage = 50
const pages = ref(0)
const isPageBtnsDisabled = ref(false)
const selectedUsers = ref<any>([])
const dateRange = ref([])
const dateRangeExport = ref([])
const selectedMP = ref('all')

const search = (event: any) => {
  items.value = [...Array(10).keys()].map((item) => event.query + '-' + item)
}

async function exportXLS() {
  isExportBtnDisabled.value = true
  const { data } = await useFetch('/api/stats/exportToExcel', {
    responseType: 'blob',
    method: 'GET',
    query: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      mp: selectedMP.value,
      filters: {
        clients: selectedUsers.value.length > 0 ? selectedUsers.value : null,
        typeoperations: type.value,
        type: service.value,
        dateRange:
          dateRangeExport.value.length > 0 ? dateRangeExport.value : null,
      },
    },
    watch: false,
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Финансовые операции.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
  isExportBtnDisabled.value = false
}

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Финансовые операции',
})

const products = ref([])

async function getStats() {
  loading.value = true
  stats.value = []
  const { data }: any = await useFetch('/api/salesAndStatistics/stats', {
    method: 'GET',
    query: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      mp: selectedMP.value,
      filters: {
        clients: selectedUsers.value.length > 0 ? selectedUsers.value : null,
        typeoperations: type.value,
        type: service.value,
        dateRange: dateRange.value.length > 0 ? dateRange.value : null,
        article: articleQuery.value,
        faceType: faceType.value,
        productName: productName.value ? productName.value : null,
      },
    },
    watch: false,
  })
  if (data.value) {
    statsCount.value = data.value.statsCount
    stats.value = data.value.stats
    pages.value = Math.ceil(statsCount.value / elPerPage)
    productsCountInfo.value = data.value.productsCountInfo
  }
  loading.value = false
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

function openUsersSelectModal() {
  selectUsersClose.value?.click()
}

async function onInputArticle(event: Event) {
  findSearchQueryDebouncedArticle()
}
async function onInput(event: Event) {
  findSearchQueryDebounced()
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

  users.value.forEach((user: any) => {
    if (selectedUsers.value.includes(user.uuid)) {
      user.isSelected = true
    }
  })
}

getUsers()
const findSearchQuery = async () => {
  //@ts-ignore
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getUsers(query.value)
  inputLoading.value = false
}
const findSearchQueryArticle = async () => {
  inputLoading.value = true
  await getStats()
  inputLoading.value = false
}

const findSearchQueryDebouncedArticle = useDebounceFn(
  findSearchQueryArticle,
  1000
)
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)
async function selectUser(uuid: String, select: boolean) {
  users.value.forEach((user: any) => {
    if (user._id === uuid) {
      if (!select) {
        user.isSelected = true
        selectedUsers.value.push(user._id)
      } else {
        user.isSelected = false
        selectedUsers.value.forEach((el: any, i: any) => {
          if (el == uuid) {
            selectedUsers.value.splice(i, 1)
          }
        })
      }
    }
  })
}

async function removeFromSelected(uuid: String) {
  users.value.forEach((user: any) => {
    if (user._id === uuid) {
      user.isSelected = false
    }
  })
}

getStats()

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('финансовые операции')
) {
  navigateTo('/partner')
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Финансовые операции</h1>
  <div class="divider"></div>

  <div class="flex flex-col justify-between">
    <div class="flex">
      <button class="ml-2 btn text-xl" @click="openUsersSelectModal">
        <!-- {{
          selectedUsers.length > 0
            ? 'Выбрано Клиентов: ' + selectedUsers.length
            : 'Выбраны все Клиенты'
        }} -->
        +
      </button>

      <select
        class="select select-bordered w-50 ml-3"
        @change=";[(curPage = 1), getStats()]"
        v-model="faceType"
      >
        <option selected value="any">Вид</option>
        <option value="yurFace">Юридическое лицо</option>
        <option value="fizFace">Физическое лицо</option>
      </select>
      <select
        class="select select-bordered w-50 ml-3"
        @change=";[(curPage = 1), getStats()]"
        v-model="type"
      >
        <option selected value="any">Все операции</option>
        <option value="Приход">Пополнения</option>
        <option value="Расход">Расходы</option>
      </select>
      <select
        class="select select-bordered w-50 ml-3"
        @change=";[(curPage = 1), getStats()]"
        v-model="service"
      >
        <option selected value="any">Все услуги</option>
        <option value="deposit">Депозит</option>
        <option value="buyouts">Выкуп</option>
        <option value="buyouts service">Услуга выкупа</option>
        <option value="allBuyouts">Выкуп + Услуга выкупа</option>
        <option value="review">Отзыв</option>
        <option value="questions">Вопрос</option>
        <option value="cart">Корзина</option>
        <option value="likeReview">Лайк отзыва</option>
        <option value="questionProduct">Вопрос</option>
        <!-- <option value="autoanswers">автоответчик</option> -->
        <option value="refund">Возврат</option>
        <option value="reviewRemoving">Удаление отзыва</option>
        <option value="likeProduct">Лайк товара</option>
        <option value="deliveries">Доставка</option>
        <option value="deliveryStorage">Штраф</option>
        <option value="other">другое</option>
      </select>
      <div>
        <label
          ><input
            v-model="articleQuery"
            type="number"
            placeholder="Артикул"
            class="input input-bordered input-l ml-4 w-44"
            @input="onInputArticle($event)"
          />
        </label>
      </div>
      <DateRangePicker
        class="w-46"
        v-model="dateRange"
        :start-date="startDate"
        @reset="dateRange = []"
      >
        <button class="btn btn-primary ml-3 min-w-2xl">
          <!-- {{
            dateRange.length > 1
              ? `${$dayjs(dateRange[0]).format('DD.MM.YYYY')} - ${$dayjs(
                  dateRange[1]
                ).format('DD.MM.YYYY')}`
              : 'Выбрать даты'
          }} -->
          <Icon name="lucide:calendar" />
        </button>
      </DateRangePicker>
      <button
        class="btn btn-primary ml-3"
        @click=";[(curPage = 1), getStats()]"
      >
        <!-- Применить -->
        <Icon name="lucide:search" />
      </button>
      <select
        @change=";[(curPage = 1), getStats()]"
        v-model="selectedMP"
        class="select select-bordered w-50 ml-3 mb-3"
      >
        <option selected value="all">Все</option>
        <option v-for="mp in mpStore.MPTabs" :value="mp.value" :key="mp.value">
          {{ mp.title }}
        </option>
      </select>

      <div class="flex gap-1">
        <DateRangePicker
          class="w-46 -mt-1"
          v-model="dateRangeExport"
          :start-date="startDate"
          @reset="dateRangeExport = []"
        >
          <button
            class="btn btn-primary text-white ml-1 border-primary mt-1 border-[1px] rounded-[6px]"
          >
            <Icon name="solar:calendar-linear" class="-mt-1" size="22px" />
          </button>
        </DateRangePicker>
        <button
          v-if="dateRangeExport.length"
          @click="dateRangeExport = []"
          class="btn btn-square flex flex-shrink btn-primary font-medium rounded-lg relative group"
        >
          <div class="flex items-center justify-center text-white">
            <Icon name="material-symbols:close-rounded" size="22px" />
          </div>
        </button>
        <button
          :disabled="isExportBtnDisabled"
          @click="exportXLS"
          class="btn flex flex-shrink btn-primary hover:text-black active:text-white font-medium rounded-lg relative group"
        >
          <div class="flex items-center justify-center">
            <Icon
              v-if="!isExportBtnDisabled"
              name="lucide:download"
              size="22px"
            />
            <span v-else class="loading loading-spinner" />
          </div>
        </button>
      </div>
      <!-- <button
        class="btn btn-primary ml-2"
        @click="exportXLS"
        :disabled="isExportBtnDisabled"
      >
        EXL
      </button> -->
    </div>
    <div v-if="service == 'buyouts'" class="mt-2">
      <label
        ><input
          v-model="productName"
          type="text"
          placeholder="Наименование товара"
          class="input input-bordered input-l ml-2 w-80"
          @input="onInputArticle($event)"
        />
      </label>
    </div>
    <div class="flex justify-end ml-2 mt-3">
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

  <div class="hero" v-if="loading">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
  <div
    v-else
    class="my-2 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table table-pin-rows">
      <!-- head -->
      <thead>
        <tr>
          <th>ID</th>
          <th>почта</th>
          <th>никнейм</th>
          <th>сумма</th>
          <th>артикул</th>
          <th>наименование товара</th>
          <th>базис</th>
          <th>комментарий</th>
          <th>
            <div @click="sortByDate" class="flex cursor-pointer">
              Дата операции
              <Icon
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="stat in stats" class="hover" :key="stat._id">
          <th
            style="max-width: 140px; min-width: 100px"
            class="overflow-x-auto text-xs"
          >
            {{ stat.uuid }}
          </th>
          <th
            style="max-width: 150px; min-width: 40px"
            class="overflow-x-auto text-xs"
          >
            {{ stat.email }}
          </th>
          <th
            style="max-width: 100px; min-width: 40px"
            class="overflow-x-auto text-xs"
          >
            {{ stat.username }}
          </th>
          <th style="max-width: 50px; min-width: 40px">
            {{ stat.summ }}
          </th>
          <th style="max-width: 40px" class="overflow-x-auto text-xs">
            {{ stat.article }}
          </th>
          <th style="max-width: 160px" class="overflow-x-auto text-xs">
            {{ stat.productName }}
          </th>
          <th style="max-width: 160px" class="overflow-x-auto text-xs">
            {{ stat.basisoperation }}
          </th>
          <th style="max-width: 160px" class="overflow-x-auto text-xs">
            {{ stat.comment }}
          </th>
          <th
            style="max-width: 15px; min-width: 10px"
            class="overflow-x-auto text-xs"
          >
            {{ stat.dataoperation.slice(0, 10) }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>

  <div
    class="mt-4 mr-6 mb-10 items-end flex justify-between"
    v-if="service == 'buyouts'"
  >
    <div></div>
    <div>
      <div class="flex">
        Выкуплено товаров:
        <div class="ml-2 text-primary font-bold">
          {{ productsCountInfo.count }} шт.
        </div>
      </div>
      <div class="flex">
        На сумму:
        <div class="ml-2 text-primary font-bold">
          {{ currency.format(productsCountInfo.sum) }}
        </div>
      </div>
    </div>
  </div>

  <!-- Put this part before </body> tag -->
  <input type="checkbox" id="selectUsers" class="modal-toggle" />
  <div class="modal cursor-pointer" @click="openUsersSelectModal">
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectUsers"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          ref="selectUsersClose"
        >
          ✕
        </label>
      </form>

      <div>
        <div class="justify-between flex">
          <div>
            <label
              ><input
                v-model="query"
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
          <label
            class="btn btn-primary mr-4 btn-sm mt-4"
            @click="
              ;[(users = []), openUsersSelectModal(), (selectedUsers = [])]
            "
            >Выбрать всех</label
          >
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
                  <div>
                    <input
                      type="checkbox"
                      :checked="user.isSelected"
                      class="checkbox checkbox-primary"
                      @click="selectUser(user._id, user.isSelected)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-action"></div>
      </div>
    </div>
  </div>
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
