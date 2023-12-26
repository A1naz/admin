<script setup lang="ts">
const { height, width } = useWindowSize()
const value = ref('')
const isAllUsersSelected = computed(() => {
  return selectedUsers.value.length > 1 ? false : true
})
const productsCountInfo = ref({
  count: 0,
  sum: 0,
})
const currency = useCurrency()
const type = ref('any')
const service = ref('any')
const articleQuery = ref('')
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

const search = (event: any) => {
  items.value = [...Array(10).keys()].map((item) => event.query + '-' + item)
}

async function exportXLS() {
  const { data } = await useFetch('/api/stats/exportToExcel', {
    responseType: 'blob',
    method: 'GET',
    query: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      filters: {
        clients: selectedUsers.value.length > 0 ? selectedUsers.value : null,
        typeoperations: type.value,
        type: service.value,
        dateRange: dateRange.value.length > 0 ? dateRange.value : null,
      },
    },
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Готовы к выдаче.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Финансовые операции',
})

const products = ref([])

async function getStats() {
  stats.value = []
  const { data }: any = await useFetch('/api/stats/stats', {
    method: 'GET',
    query: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      filters: {
        clients: selectedUsers.value.length > 0 ? selectedUsers.value : null,
        typeoperations: type.value,
        type: service.value,
        dateRange: dateRange.value.length > 0 ? dateRange.value : null,
        article: articleQuery.value,
      },
    },
  })
  if (data.value) {
    statsCount.value = data.value.statsCount
    stats.value = data.value.stats
    pages.value = Math.ceil(statsCount.value / elPerPage)
    productsCountInfo.value = data.value.productsCountInfo
  }
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
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/salesAndStatistics">Финансовые операции</NuxtLink>
      </li>
      <!-- <li>
                    <NuxtLink to="/partner/management">Управление партнерами</NuxtLink>
                </li> -->
    </ul>
  </div>
  <div class="divider"></div>
  <div class="flex justify-between">
    <div class="flex">
      <button class="ml-2 btn" @click="openUsersSelectModal">
        {{
          selectedUsers.length > 0
            ? 'Выбрано Клиентов: ' + selectedUsers.length
            : 'Выбраны все Клиенты'
        }}
      </button>

      <select
        class="select select-bordered w-50 ml-3"
        @change="[(curPage = 1), getStats()]"
        v-model="type"
      >
        <option selected value="any">все типы операции</option>
        <option value="Приход">приход</option>
        <option value="Расход">расход</option>
      </select>
      <select
        class="select select-bordered w-50 ml-3"
        @change=";[(curPage = 1), getStats()]"
        v-model="service"
      >
        <option selected value="any">все услуги</option>
        <option value="deposit">депозит</option>
        <option value="buyouts">выкупы</option>
        <option value="reviews">отзывы</option>
        <option value="questions">вопросы</option>
        <option value="carts">корзина</option>
        <option value="likes">лайки</option>
        <option value="autoanswers">автоответчик</option>
        <option value="refund">возврат</option>
        <option value="productlikes">лайки на товаров</option>
        <option value="payments">оплата</option>
        <option value="other">другое</option>
        <option value="buyouts service">услуги выкупов</option>
        <option value="deliveries">доставки</option>
        <option value="penalty">штрафы</option>
      </select>
      <div v-if="service == 'buyouts'">
        <label
          ><input
            v-model="articleQuery"
            type="number"
            placeholder="Артикул"
            class="input input-bordered input-l ml-4 w-44"
            @input="onInputArticle($event)"
          />
        </label>
        <span
          v-if="inputLoading"
          class="loading loading-spinner text-primary loading-large ml-4"
        />
      </div>
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
      <button class="btn btn-sm btn-primary mr-3" @click="exportXLS">
        Экспорт
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
          <th>ID</th>
          <th>почта</th>
          <th>никнейм</th>
          <th>телеграм</th>
          <th>сумма</th>
          <th v-if="service == 'buyouts' || service == 'any'">артикул</th>
          <th v-if="service == 'buyouts' || service == 'any'">наименование товара</th>
          <th>базис</th>
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
        <tr v-for="stat in stats" class="hover">
          <th
            style="max-width: 140px; min-width: 100px"
            class="overflow-x-auto text-xs"
          >
            {{ stat._id }}
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
          <th
            style="max-width: 100px; min-width: 40px"
            class="overflow-x-auto text-xs"
          >
            {{ stat.telegram }}
          </th>
          <th style="max-width: 50px; min-width: 40px">
            {{ stat.summ }}
          </th>
          <th
            style="max-width: 40px"
            v-if="service == 'buyouts' || service == 'any'"
            class="overflow-x-auto text-xs"
          >
            {{ stat.article }}
          </th>
          <th
            style="max-width: 160px"
            v-if="service == 'buyouts' || service == 'any'"
            class="overflow-x-auto text-xs"
          >
            {{ stat.productName }}
          </th>
          <th style="max-width: 160px" class="overflow-x-auto text-xs">
            {{ stat.basisoperation }}
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
                placeholder="id, username, email, telegram"
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
                <th>email</th>
                <th>telegram</th>
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
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.telegram }}
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
