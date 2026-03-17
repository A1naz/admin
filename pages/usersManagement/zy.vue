<script setup lang="ts">
const { height, width } = useWindowSize()
const value = ref('')
const type = ref('any')
const service = ref('any')
const tabOption = ref('buyouts')
const statusOption = ref('any')
const imageModalClose: any = ref(null)
const info = ref<any>([])
import { notify } from '@kyvg/vue3-notification'
const { $dayjs } = useNuxtApp()
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const selectUserClose: any = ref(null)
const dateSortIcon = ref('mdi-arrow-down')
const items = ref<any>([
  { label: 'Item 1', value: 'Item 1' },
  { label: 'Item 2', value: 'Item 2' },
  { label: 'Item 3', value: 'Item 3' },
])
const query = ref('')
const serviceId = ref('')
const users = ref<any>([])
const inputLoading = ref(false)
const curPage = ref(1)

const infoCount = ref(0)
const elPerPage = 50
const pages = ref(0)
const isPageBtnsDisabled = ref(false)
const selectedUser: any = ref({
  username: '',
})
const dateRange = ref([])
const mpStore = useMPStore()

// State for LogModal
const logModalState = ref(false)
const selectedReview: any = ref({})

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Управление пользователями',
})

const tabs = ref([
  {
    title: 'buyouts',
    headers: [
      { key: 'uuid', title: 'ID' },
      { key: 'article', title: 'артикул' },
      { key: 'status', title: 'статус' },
      { key: 'quantity', title: 'количество' },
      { key: 'point', title: 'адрес' },
      { key: 'rules', title: 'правила' },
      { key: 'sizeParam', title: 'размер' },
      { key: 'gender', title: 'пол' },
      { key: 'dateRange', title: 'даты выкупов' },
      { key: 'trueDate', title: 'дата' },
      { key: 'details', title: 'детали' },
    ],
    statuses: [
      { key: 'any', title: 'Все' },
      { key: 'active', title: 'Созданные' },
      { key: 'work', title: 'В работе' },
      { key: 'active', title: 'Активные' },
      { key: 'archived', title: 'В архиве' },
      { key: 'completed', title: 'Завершенные' },
      { key: 'paused', title: 'На пазуе' },
    ],
  },
  {
    title: 'deliveries',
    headers: [
      { key: 'uuidbuyout', title: 'ID выкупа' },
      { key: 'article', title: 'артикул' },
      { key: 'status', title: 'статус' },
      { key: 'recipient', title: 'получатель' },
      { key: 'point', title: 'адрес' },
      { key: 'recipientphone', title: 'телефон' },
      { key: 'trueDate', title: 'обновлено' },
      { key: 'screenCreate', title: '  ' },
    ],
    statuses: [
      { key: 'any', title: 'Все' },
      { key: 'work', title: 'Активные' },
      { key: 'completed', title: 'Завершенные' },
      { key: 'ready', title: 'Готовы к выдаче' },
      { key: 'canceled', title: 'Возврат/Отмена' },
      { key: 'reviewsUpdate', title: 'Отзыв на проверке' },
    ],
  },
  {
    title: 'reviews',
    headers: [
      { key: 'uuidbuyout', title: 'ID выкупа' },
      { key: 'name', title: 'название' },
      { key: 'article', title: 'артикул' },
      { key: 'status', title: 'статус' },
      { key: 'text', title: 'текст' },
      { key: 'recipientphone', title: 'телефон' },
      { key: 'trueDate', title: 'дата' },
      { key: 'details', title: 'детали' },
    ],
    statuses: [
      // { key: 'available', title: 'доступные' },
      { key: 'any', title: 'Все' },
      { key: 'published', title: 'опубликованные' },
      { key: 'work', title: 'в работе' },
      { key: 'canceled', title: 'отмененные' },
      { key: 'deleting', title: 'на удалении' },
      { key: 'deleted', title: 'удаленные' },
      { key: 'nofunds', title: 'недостаточно средств' },
      { key: 'archived', title: 'в архиве' },
      { key: 'reviewsUpdate', title: 'Отзыв на проверке' },
    ],
  },
  {
    title: 'likes',
    headers: [
      { key: 'article', title: 'артикул' },
      { key: 'likes', title: 'лайки' },
      { key: 'dislikes', title: 'дизлайки' },
      { key: 'status', title: 'статус' },
      { key: 'trueDate', title: 'дата создания' },
      { key: 'trueEndedDate', title: 'дата завершения' },
      { key: 'period', title: 'сроки' },
    ],
  },
  {
    title: 'productLikes',
    headers: [
      { key: 'type', title: 'тип' },
      { key: 'status', title: 'статус' },
      { key: 'name', title: 'название' },
      { key: 'createdDate', title: 'дата создания' },
      { key: 'endedDate', title: 'дата завершения' },
    ],
  },
  {
    title: 'questions',
    headers: [
      { key: 'article', title: 'артикул' },
      { key: 'gender', title: 'пол' },
      { key: 'text', title: 'текст' },
      { key: 'status', title: 'статус' },
      { key: 'trueDate', title: 'дата создания' },
      { key: 'trueEndedDate', title: 'дата публикации' },
    ],
  },
  {
    title: 'cart',
    headers: [
      { key: 'article', title: 'артикул' },
      { key: 'size', title: 'размер' },
      { key: 'amount', title: 'кол-во' },
      { key: 'query', title: 'ключевой запрос' },
      { key: 'status', title: 'статус' },
      { key: 'trueDate', title: 'дата создания' },
      { key: 'trueEndedDate', title: 'дата публикации' },
    ],
  },
  {
    title: 'reports',
    headers: [
      { key: 'uuidbuyout', title: 'ID выкупа' },
      { key: 'card', title: 'корзина' },
      { key: 'trueDate', title: 'дата создания' },
    ],
  },
])

const selectedTab: any = ref({
  ...tabs.value[0],
})

const search = (event: any) => {
  items.value = [...Array(10).keys()].map((item) => event.query + '-' + item)
}

async function getInfo() {
  const { data }: any = await useFetch('/api/zy/management/get', {
    method: 'GET',
    query: {
      page: curPage.value,
      item: tabOption.value,
      status: statusOption.value,
      userId: selectedUser.value._id,
      serviceId: serviceId.value,
    },
  })
  if (data.value) {
    infoCount.value = data.value.count
    info.value = data.value.info
    pages.value = Math.ceil(infoCount.value / elPerPage)
  }
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
  info.value = []
  await getInfo()
  isPageBtnsDisabled.value = false
}

function openUsersSelectModal() {
  selectUserClose.value?.click()
}

async function onInputService(event: Event) {
  findSearchQueryDebouncedService()
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

const findSearchQueryService = async () => {
  //@ts-ignore
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getInfo()
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)
const findSearchQueryDebouncedService = useDebounceFn(
  findSearchQueryService,
  1000
)
async function selectUser(user: any) {
  selectedUser.value = user
  getInfo()
  selectUserClose.value?.click()
}

function changeTabs() {
  curPage.value = 1
  selectedTab.value = tabs.value.find((tab: any) => {
    if (tab.title == tabOption.value) {
      return tab
    }
  })

  statusOption.value = 'any'
  info.value = []
  getInfo()
}

const selectedImage = ref('null')
function openImageModal(img: string) {
  selectedImage.value = img
  imageModalClose.value?.click()
}
function closeImageModal() {
  imageModalClose.value?.click()
}

async function banUnbanUser() {
  const { data }: any = await useFetch('/api/user/banUnbanUser', {
    method: 'GET',
    params: {
      userId: selectedUser.value._id,
    },
  })

  if (data.value) {
    selectedUser.value.isBanned
      ? (selectedUser.value.isBanned = false)
      : (selectedUser.value.isBanned = true)
    let message = ''
    if (selectedUser.value.isBanned) {
      message = 'Пользователь заблокирован'
    } else {
      message = 'Пользователь разблокирован'
    }

    notify({
      type: 'success',
      title: message,
    })
  }
}

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('управление пользователями платформы')
) {
  navigateTo('/partner')
}

function changeMP(event: any) {
  if (event.target.value !== 'zy') {
    if (event.target.value === 'wildberries') {
      navigateTo('/usersManagement')
    } else navigateTo('/usersManagement/' + event.target.value)
  }
}

function openLogModal(item: any) {
  selectedReview.value = item
  logModalState.value = true
}

function closeLogModal() {
  logModalState.value = false
}

function openScreenshots(item: any, mp: string) {
  window.open(
    `/screenshots?mp=${mp}&article=${item.article}&recipientphone=${item.recipientphone}&openModal=true`,
    '_blank'
  )
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Управление пользователями</h1>
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5"></div>
  <div class="divider"></div>

  <div class="flex justify-between">
    <div class="flex">
      <div>
        <select
          class="select select-bordered max-w-xs ml-2 mb-2"
          @change="changeMP($event)"
        >
          <option
            v-for="tab in mpStore.MPTabs"
            :key="tab.value"
            :value="tab.value"
            :selected="tab.value == 'zy'"
          >
            {{ tab.title }}
          </option>
        </select>
      </div>
      <button class="ml-2 btn max-w-xl w-xl" @click="openUsersSelectModal">
        <!-- {{
          selectedUser.username == ''
            ? 'Выбрать пользователя'
            : selectedUser.username
        }} -->
        +
      </button>
      <!-- 
      <select
        class="select select-bordered w-50 ml-3"
        @change="getStats"
        v-model="type"
      >
        <option selected value="any">все типы операции</option>
        <option value="Приход">приход</option>
        <option value="Расход">расход</option>
      </select> -->

      <div
        v-if="
          tabOption == 'buyouts' ||
          tabOption == 'deliveries' ||
          tabOption == 'reviews'
        "
      >
        <label
          ><input
            v-model="serviceId"
            type="text"
            placeholder="Id услуги"
            class="input input-bordered input-l ml-2"
            @input="onInputService($event)"
          />
        </label>
        <span
          v-if="inputLoading"
          class="loading loading-spinner text-primary loading-large ml-4"
        />
      </div>
      <select
        class="select select-bordered w-50 ml-3"
        @change="changeTabs"
        v-model="tabOption"
      >
        <option selected value="buyouts">выкупы</option>
        <option value="deliveries">доставки</option>
        <option value="reviews">отзывы</option>
        <!-- <option value="likes">лайки на отзывы</option>
        <option value="questions">вопросы</option>
        <option value="productLikes">лайки на товары</option>
        <option value="cart">корзина</option>
        <option value="reports">отчеты по выкупам</option> -->
      </select>
      <select
        v-if="
          tabOption == 'buyouts' ||
          tabOption == 'deliveries' ||
          tabOption == 'reviews'
        "
        class="select select-bordered w-50 ml-3"
        @change="getInfo"
        v-model="statusOption"
      >
        <option
          v-for="status in selectedTab.statuses"
          :key="status.key"
          :value="status.key"
        >
          {{ status.title }}
        </option>
      </select>
      <!-- <DateRangePicker
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
      </DateRangePicker> -->
      <button class="btn btn-primary ml-3" @click="getInfo">Применить</button>

      <button
        class="btn btn-error bg-red-400 ml-3"
        v-if="selectedUser.username.length > 2 && !selectedUser.isBanned"
        @click="banUnbanUser"
      >
        Заблокировать
      </button>
      <button
        class="btn btn-primary ml-3"
        v-if="selectedUser.isBanned"
        @click="banUnbanUser"
      >
        Разблокировать
      </button>
    </div>
    <div>
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
          <th
            v-if="
              tabOption == 'reviews' ||
              tabOption == 'likes' ||
              tabOption == 'cart' ||
              tabOption == 'questions' ||
              tabOption == 'productLikes'
            "
          >
            Изображени{{ tabOption == 'reviews' ? 'я' : 'е' }}
          </th>
          <th v-for="header in selectedTab.headers" :key="header">
            {{ header.title[0].toUpperCase() + header.title.slice(1) }}
          </th>
          <th v-if="tabOption == 'reports'" class="text-center">Изображения</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="item in info" class="hover" :key="item._id">
          <th v-if="tabOption == 'reviews'">
            <div>
              <div v-for="img in item.images" :key="img">
                <img
                  :src="img"
                  class="cursor-pointer rounded w-24 mt-2 overflow-y-auto"
                  @click="openImageModal(img)"
                />
              </div>
            </div>
          </th>
          <th
            v-if="
              tabOption == 'likes' ||
              tabOption == 'productLikes' ||
              tabOption == 'cart' ||
              tabOption == 'questions'
            "
          >
            <div>
              <img
                :src="item.image"
                class="cursor-pointer rounded w-24 mt-2 overflow-y-auto"
                @click="openImageModal(item.image)"
              />
            </div>
          </th>
          <th
            v-for="header in selectedTab.headers"
            :key="header.key"
            style="max-width: 140px; min-width: 40px"
          >
            {{
              header.key == 'article' ||
              (header.key == 'name' && tabOption == 'productLikes') ||
              header.key == 'details' ||
              header.key == 'screenCreate'
                ? null
                : Array.isArray(item[header.key])
                ? item[header.key].join(', ')
                : item[header.key]
            }}
            <div v-if="header.key == 'article'" class="text-purple-500">
              <a
                target="_blank"
                :href="`https://market.yandex.ru/product/${item.article}`"
              >
                {{ item[header.key] }}
              </a>
            </div>
            <div
              v-if="header.key == 'name' && tabOption == 'productLikes'"
              class="text-purple-500"
            >
              <a target="_blank" :href="item.url">
                {{ item[header.key] }}
              </a>
            </div>
            <div v-if="header.key == 'details'">
              <button class="btn btn-sm btn-primary" @click="openLogModal(item)">
                Детали
              </button>
            </div>
            <div v-if="header.key == 'screenCreate'">
              <button
                class="btn btn-sm btn-primary btn-square"
                @click="openScreenshots(item, 'zy')"
              >
                <Icon name="streamline-flex:screenshot-remix" size="20" />
              </button>
            </div>
          </th>
          <th v-if="tabOption == 'reports'">
            <div class="flex max-w-lg overflow-x-auto justify-end">
              <div v-for="img in item.screenshots" :key="img">
                <img
                  :src="img"
                  class="cursor-pointer rounded w-16 ml-1"
                  @click="openImageModal(img)"
                />
              </div>
            </div>
          </th>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Put this part before </body> tag -->
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
  <LogModal
    :info="selectedReview"
    :state="logModalState"
    mp="goldApple"
    @close="closeLogModal"
  />
</template>
<style scoped>
::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
}
</style>
