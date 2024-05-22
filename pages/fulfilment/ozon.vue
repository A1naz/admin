<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Фулфилмент',
})

import { notify } from '@kyvg/vue3-notification'
import usersPVZsGet from '~/server/api/wildberries/ff/usersPVZs.get'

const { height, width } = useWindowSize()

const mpStore = useMPStore()

const modalOpen = ref(false)
const dateSortIcon = ref('mdi-arrow-down')
const elPerPage = 50
const inputLoading = ref(false)
const curPage = ref(1)
const pages = ref(0)
const query = ref('')
const pvzQuery = ref('')
const isPageBtnsDisabled = ref(false)
const users = ref<any>([])
const pvzs = ref<any>([])
const userPvzs = ref<any>([])
const pvzsCount = ref(0)
const selectUserClose: any = ref(null)
const selectPVZClose: any = ref(null)
const selectedMP = ref('ozon')
const selectedUser: any = ref({
  username: '',
})

function selectUser(user: any) {
  selectedUser.value = user
  selectUserClose.value?.click()
  getPvzs()
}

async function getPvzs() {
  const { data }: any = await useFetch(
    '/api/' + selectedMP.value + '/ff/usersPVZs',
    {
      method: 'GET',
      params: {
        page: curPage.value,
        userId:
          selectedUser.value.username.length > 0
            ? selectedUser.value._id
            : null,
      },
      watch: false,
    }
  )
  if (data.value) {
    userPvzs.value = data.value.PVZs
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
  users.value = []
  await getPvzs()
  isPageBtnsDisabled.value = false
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
async function getPoints(searchValue: string = '') {
  const { data }: any = await useFetch(`/api/${selectedMP.value}/ff/points`, {
    method: 'GET',
    params: {
      page: 1,
      searchValue,
    },
    watch: false,
  })

  pvzs.value = data.value.PVZs
}

const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getUsers(query.value)
  inputLoading.value = false
}

const findSearchQueryPVZ = async () => {
  if (pvzQuery.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getPoints(pvzQuery.value)
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)
const findSearchQueryPVZDebounced = useDebounceFn(findSearchQueryPVZ, 1000)

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

async function onInputPVZ(event: Event) {
  findSearchQueryPVZDebounced()
}

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getPvzs()
}

function openUsersSelectModal() {
  selectUserClose.value?.click()
}
function openPVZSelectModal() {
  selectPVZClose.value?.click()
}

function changeMP(event: any) {
  pvzs.value = []
  userPvzs.value = []
  selectedMP.value = event.target.value
  mpStore.selectedMP = event.target.value
  mpStore.selectedMP = event.target.value
  navigateTo('/fulfilment/' + selectedMP.value)
}

function handleAddress(address: string, lt: number, lg: number, id: string) {
  selectPVZ({ address, lt, lg, id })
}

async function selectPVZ(pvz: any) {
  const { data, error }: any = await useFetch(`/api/ozon/ff/addPVZ`, {
    method: 'POST',
    body: {
      userId: selectedUser.value._id,
      pvz,
    },
    watch: false,
  })
  if (data.value.status == 'ok') {
    notify({
      type: 'success',
      title: 'Добавлено в список пвз пользователя',
    })
    getPvzs()
  } else if (data.value.status == 'error') {
    notify({
      type: 'error',
      title: 'Не удалось добавить в список пвз пользователя',
      text: data.value.message,
    })
  }
}

async function deletePVZ(pvz: any) {
  const { data, error }: any = await useFetch(
    `/api/${selectedMP.value}/ff/deletePVZ`,
    {
      method: 'POST',
      body: {
        userId: selectedUser.value._id,
        pvz,
      },
    }
  )
  if (data.value.status == 'ok') {
    notify({
      type: 'success',
      title: 'Удалено из списка пвз пользователя',
    })
    getPvzs()
  } else if (data.value.status == 'error') {
    notify({
      type: 'error',
      title: 'Не удалось удалить из списка пвз пользователя',
      text: data.value.message,
    })
  }
}

function closeModal() {
  modalOpen.value = false
}

const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('фулфилмент')) {
  navigateTo('/partner')
}

const pickpoints = shallowRef()
const pvzLoading = ref(false)
async function getPickpoints() {
  pvzLoading.value = true
  try {
    const data = await $fetch('/api/ozon/ff/pickpoints', {
      method: 'GET',
    })
    pickpoints.value = (data as any).points
  } catch (e: any) {
    notify({
      title: 'Что-то пошло не так',
      text: e?.message,
      type: 'error',
      duration: 3000,
    })
  }
  pvzLoading.value = false
}

getPickpoints()
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Фулфилмент</h1>
    <div class="divider"></div>
    <div class="flex justify-between">
      <div class="flex">
        <select
          class="select select-bordered max-w-xs mb-2"
          @change="($event) => changeMP($event)"
        >
          <option
            v-for="tab in mpStore.MPTabs"
            :key="tab.value"
            :value="tab.value"
            :selected="tab.value == 'ozon'"
          >
            {{ tab.title }}
          </option>
        </select>
        <button
          class="ml-2 btn max-w-xl w-xl join-item"
          @click="openUsersSelectModal"
        >
          {{
            selectedUser.username == ''
              ? 'Выбрать пользователя'
              : selectedUser.username
          }}
        </button>
        <button
          class="btn btn-circle"
          v-if="selectedUser.username.length > 0"
          @click="
            ;[
              (selectedUser = {
                username: '',
              }),
              getPvzs(),
            ]
          "
        >
          ✕
        </button>

        <!-- <button class="btn btn-primary ml-3" @click="getActs">Применить</button> -->
        <button
          class="ml-4 btn max-w-xl w-xl join-item"
          @click="modalOpen = true"
          :disabled="selectedUser.username.length == 0 || pvzLoading"
  
        >
          Добавить ПВЗ
        </button>
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
            <th>Адрес</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr v-for="pvz in userPvzs" class="hover">
            <th style="max-width: 300px; min-width: 140px">
              {{ pvz.address }}
            </th>
            <th style="max-width: 100px; min-width: 90px">
              <button class="btn btn-warning btn-sm" @click="deletePVZ(pvz)">
                Удалить
              </button>
            </th>
          </tr>
        </tbody>
      </table>
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
  <ffOzonSelectPointModal
    v-if="modalOpen"
    :state="modalOpen"
    :pickpoints="pickpoints"
    @callback="handleAddress"
    @close="closeModal"
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
