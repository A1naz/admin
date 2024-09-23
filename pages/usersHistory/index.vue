<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'История действий пользователя',
})

import { notify } from '@kyvg/vue3-notification'
const { height, width } = useWindowSize()
const dateSortIcon = ref('mdi-arrow-down')
const elPerPage = 50
const inputLoading = ref(false)
const curPage = ref(1)
const pages = ref(0)
const query = ref('')
const isPageBtnsDisabled = ref(false)
const adminUsers = ref<any>([])
const acts = ref<any>([])
const actsCount = ref(0)
const selectAdminUserClose: any = ref(null)
const dateRange = ref([])
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const selectedAdminUser: any = ref({
  username: '',
})

function openAdminUsersSelectModal() {
  selectAdminUserClose.value?.click()
}

function selectAdminUser(user: any) {
  selectedAdminUser.value = user
  selectAdminUserClose.value?.click()
  getActs()
}

async function getActs() {
  
  const { data }: any = await useFetch('/api/userLogs/get', {
    method: 'GET',
    params: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      adminUserId:
        selectedAdminUser.value.username.length > 0
          ? selectedAdminUser.value._id
          : null,
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
    },
  })
  if (data.value) {
    actsCount.value = data.value.count
    acts.value = data.value.acts
    pages.value = Math.ceil(actsCount.value / elPerPage)
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
  adminUsers.value = []
  await getActs()
  isPageBtnsDisabled.value = false
}

async function getUsers(searchValue: string = '') {

  const { data }: any = await useFetch('/api/user/getUsers', {
    method: 'GET',
    params: {
      page: 1,
      searchValue,
    },
  })

  adminUsers.value = data.value.users
}

const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getUsers(query.value)
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)
async function selectUser(user: any) {
  selectedAdminUser.value = user
  getActs()
  selectAdminUserClose.value?.click()
}

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getActs()
}

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('история действий пользователей')
) {
  navigateTo('/partner')
}

await getActs()
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">История действий пользователей</h1>
    <div class="card p-fluid"></div>

    <div class="divider"></div>
    <div class="flex justify-between">
      <div class="flex">
        <button
          class="ml-2 btn max-w-xl w-xl"
          @click="openAdminUsersSelectModal"
        >
          {{
            selectedAdminUser.username == ''
              ? 'Выбрать пользователя'
              : selectedAdminUser.username
          }}
        </button>

        <button
          class="btn btn-circle"
          v-if="selectedAdminUser.username.length > 0"
          @click="
            ;[
              (selectedAdminUser = {
                username: '',
              }),
              getActs(),
            ]
          "
        >
          ✕
        </button>
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
        <button class="btn btn-primary ml-3" @click="getActs">Применить</button>
      </div>
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

    <div
      class="my-2 mx-2 overflow-y-auto"
      :style="{ 'max-height': height - 270 + 'px' }"
    >
      <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th>_ID пользователя</th>
            <th>Никнейм пользователя</th>
            <th>Описание</th>
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
          <tr v-for="act in acts" class="hover">
            <th style="max-width: 80px; min-width: 70px">
              {{ act.userId }}
            </th>
            <th style="max-width: 95px; min-width: 90px" class="text-xs">
              {{ act.userNick }}
            </th>
            <th style="max-width: 300px; min-width: 140px">
              {{ act.description }}
            </th>
            <th
              style="max-width: 60px; min-width: 40px"
              class="overflow-x-auto"
            >
              {{ $dayjs(act.createdAt).format('DD.MM.YYYY HH:mm') }}
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <input type="checkbox" id="selectAdminUser" class="modal-toggle" />
  <div class="modal cursor-pointer" @click="openAdminUsersSelectModal">
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectAdminUser"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          ref="selectAdminUserClose"
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
                <th>организация</th>
                <th>email</th>
                <th>Выбрать</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover" v-for="admin in adminUsers" :key="admin.uuid">
                <td style="max-width: 130px">{{ admin._id }}</td>
                <td style="max-width: 150px">
                  <div class="mx-1 overflow-x-auto">
                    {{ admin.username }}
                  </div>
                </td>
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ admin.organization }}
                  </div>
                </td>
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ admin.email }}
                  </div>
                </td>
                <td style="max-width: 20px">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="selectAdminUser(admin)"
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
