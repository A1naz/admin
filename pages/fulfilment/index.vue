<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Фулфилмент',
})

import { notify } from '@kyvg/vue3-notification'

const { height, width } = useWindowSize()

const mpStore = useMPStore()

const dateSortIcon = ref('mdi-arrow-down')
const elPerPage = 50
const inputLoading = ref(false)
const curPage = ref(1)
const pages = ref(0)
const query = ref('')
const isPageBtnsDisabled = ref(false)
const adminUsers = ref<any>([])
const pvzs = ref<any>([])
const pvzsCount = ref(0)
const selectUserClose: any = ref(null)
const selectedMP = ref('wildberries')
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
    }
  )
  if (data.value) {
    pvzsCount.value = data.value.count
    pvzs.value = data.value.acts
    pages.value = Math.ceil(pvzsCount.value / elPerPage)
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

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getPvzs()
}

const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('фулфилмент')) {
  navigateTo('/partner')
}

function openUsersSelectModal() {
  selectUserClose.value?.click()
}

function changeMP(event: any) {
  selectedMP.value = event.target.value
  getPvzs()
}
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Фулфилмент</h1>
    <div class="divider"></div>
    <div class="flex justify-between">
      <div class="flex">
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

        <select
          class="select select-bordered max-w-xs mb-2"
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
            <th>ID пользователя</th>
            <th>Адрес</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr v-for="pvz in pvzs" class="hover">
            <th style="max-width: 80px; min-width: 70px"></th>
            <th style="max-width: 300px; min-width: 140px" class="text-xs"></th>
            <th style="max-width: 100px; min-width: 90px"></th>
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
              <tr class="hover" v-for="admin in adminUsers" :key="admin.uuid">
                <td style="max-width: 130px">{{ admin.uuid }}</td>
                <td style="max-width: 150px">
                  <div class="mx-1 overflow-x-auto">
                    {{ admin.username }}
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
                    @click="selectUser(admin)"
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
