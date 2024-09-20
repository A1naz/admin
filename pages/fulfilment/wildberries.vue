<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Фулфилмент',
})

import { notify } from '@kyvg/vue3-notification'
import deleteAllPVZPost from '~/server/api/wildberries/ff/deleteAllPVZ.post'
import usersPVZsGet from '~/server/api/wildberries/ff/usersPVZs.get'

const { height, width } = useWindowSize()

const mpStore = useMPStore()
const store = useMainStore()

const date = ref(new Date())
date.value.setHours(12, 0, 0, 0)

const confirmModal = ref(false)
const modalOpen = ref(false)
const pvzLoading = ref(false)
const dateSortIcon = ref('mdi-arrow-down')
const inputLoading = ref(false)
const curPage = ref(1)
const pages = ref(0)
const query = ref('')
const pvzQuery = ref('')
const isPageBtnsDisabled = ref(false)
const users = ref<any>([])
const pvzs = ref<any>([])
const userPvzs = ref<any>([])
const selectPVZClose: any = ref(null)
const selectedMP = ref('wildberries')
const selectedUsers: any = ref<any>([])
const addingPVZ = ref(false)
const pvzsTemplates = ref<any>([])
const templateName = ref('')
const createTemplate = ref<any>(null)

watch(selectedUsers.value, () => {
  if (selectedUsers.value.length > 0) {
    getPvzs()
  }
})

async function getPvzs() {
  const { data }: any = await useFetch(
    '/api/' + selectedMP.value + '/ff/usersPVZs',
    {
      method: 'GET',
      params: {
        page: curPage.value,
        userId: selectedUsers.value.map((el: any) => el._id),
        date: new Date(date.value).toISOString(),
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

function openPVZSelectModal() {
  selectPVZClose.value?.click()
}

function changeMP(event: any) {
  pvzs.value = []
  userPvzs.value = []
  selectedMP.value = event.target.value
  mpStore.selectedMP = event.target.value
  navigateTo('/fulfilment/' + selectedMP.value)
}

async function selectPVZ(pvz: any) {
  addingPVZ.value = true
  const { data, error }: any = await useFetch(
    `/api/${selectedMP.value}/ff/addPVZ`,
    {
      method: 'POST',
      body: {
        userId: selectedUsers.value.map((el: any) => el._id),
        pvz,
        date: date.value,
      },
      watch: false,
    }
  )
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
  addingPVZ.value = false
}

async function deletePVZ(pvz: any) {
  const { data, error }: any = await useFetch(
    `/api/${selectedMP.value}/ff/deletePVZ`,
    {
      method: 'POST',
      body: {
        userId: selectedUsers.value.map((el: any) => el._id),
        pvz,
        date: date.value,
      },
      watch: false,
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

const pickpoints = shallowRef()
async function getPickpoints() {
  pvzLoading.value = true
  try {
    const data = await $fetch('/api/wildberries/ff/pickpoints', {
      method: 'GET',
      watch: false,
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

function handleAddress(
  address: string,
  lt: number,
  lg: number,
  id: string,
  w: string
) {
  console.log(address, lt, lg, id)

  selectPVZ({ address, lt, lg, id, w })
}

function closeModal() {
  modalOpen.value = false
}

const getTemplates = async () => {
  const { data }: any = await useFetch('/api/wildberries/pvz/templates', {
    method: 'GET',
    watch: false,
  })
  if (data) {
    pvzsTemplates.value = data.value
  }
}

getTemplates()

async function saveTemplate() {
  const { data }: any = await useFetch('/api/wildberries/pvz/saveTemplate', {
    method: 'POST',
    body: {
      pvzs: userPvzs.value,
      title: templateName.value,
    },
    watch: false,
  })
  if (data.value) {
    notify({
      type: 'success',
      title: 'Шаблон сохранен',
    })
    getTemplates()
    createTemplate.value.click()
    templateName.value = ''
  }
}
async function deleteTemplate(uuid: string) {
  const { data }: any = await useFetch('/api/wildberries/pvz/deleteTemplate', {
    method: 'POST',
    body: {
      uuid,
    },
    watch: false,
  })
  if (data.value) {
    notify({
      type: 'success',
      title: 'Шаблон успешно удален',
    })
    getTemplates()
  }
}

async function useTemplate(pvzs: any) {
  const { data }: any = await useFetch('/api/wildberries/ff/templateAddPVZs', {
    method: 'POST',
    body: {
      userId: selectedUsers.value.map((el: any) => el._id),
      pvzs,
      date: date.value,
    },
    watch: false,
  })
  if (data.value) {
    notify({
      type: 'success',
      title: 'Адреса успешно добавлены',
    })
    getPvzs()
  }
}

if (!store.client.mainAdmin && !store.client.tabs.includes('фулфилмент')) {
  navigateTo('/partner')
}

async function deleteAllPVZs() {
  const { data, error }: any = await useFetch(
    `/api/${selectedMP.value}/ff/deleteAllPVZ`,
    {
      method: 'POST',
      body: {
        userId: selectedUsers.value.map((el: any) => el._id),
        date: date.value,
      },
      watch: false,
    }
  )
  if (data.value.status == 'ok') {
    notify({
      type: 'success',
      title: 'ПВЗ успешно удалены из списка пвз пользователя',
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
            v-for="tab in mpStore.MPTabs.filter((el) => el.value != 'avito')"
            :key="tab.value"
            :value="tab.value"
            :selected="tab.value == 'wildberries'"
          >
            {{ tab.title }}
          </option>
        </select>
        <ModalManyUsers :selectedUsers="selectedUsers" />

        <div class="ml-3">
          <DateOnlyPicker
            ref="datePicker"
            :modelValue="date"
            :min-date="new Date(Date.now() - 1000 * 60 * 60 * 24)"
            :size="'md'"
            @update:modelValue=";[(date = $event), getPvzs()]"
          />
        </div>
        <button
          class="ml-4 btn max-w-xl w-xl join-item"
          @click="modalOpen = true"
          :disabled="selectedUsers.length == 0 || pvzLoading"
        >
          {{ pvzLoading ? 'Загрузка...' : 'Добавить ПВЗ' }}
        </button>
      </div>

      <div class="flex flex-col">
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

    <div class="my-2 -ml-1 flex">
      <div class="collapse bg-base-200 max-w-sm mr-2 -mt-0.5">
        <input ref="createTemplate" type="checkbox" />
        <div class="collapse-title font-medium">
          Создать шаблон из текущих пвз
        </div>
        <div class="collapse-content">
          <input
            type="text"
            placeholder="Название шаблона"
            class="input input-bordered input-l"
            v-model="templateName"
          />
          <button
            class="btn btn-primary mt-2 ml-2"
            :disabled="userPvzs.length == 0"
            @click="saveTemplate"
          >
            {{ userPvzs.length == 0 ? 'Нет пвз' : 'Сохранить' }}
          </button>
        </div>
      </div>
      <FfPVZTemplatesModal
        :templates="pvzsTemplates"
        @useTemplate="(pvzs: any) => useTemplate(pvzs)"
        @deleteTemplate="(uuid: string) => deleteTemplate(uuid)"
      />
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
            <th>
              <button
                class="btn btn-warning btn-sm"
                :disabled="!userPvzs || !userPvzs.length"
                @click="confirmModal = true"
              >
                Удалить все пвз
              </button>
            </th>
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

  <input type="checkbox" id="selectPVZ" class="modal-toggle" />
  <div class="modal cursor-pointer" @click="openPVZSelectModal">
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectPVZ"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          ref="selectPVZClose"
        >
          ✕
        </label>
      </form>

      <div>
        <div class="justify-between flex">
          <div>
            <label
              ><input
                v-model="pvzQuery"
                type="text"
                placeholder="Введите Адрес"
                class="input input-bordered input-l ml-4 w-80"
                @input="onInputPVZ($event)"
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
                <th>Адрес</th>
                <th>Выбрать</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover" v-for="pvz in pvzs" :key="pvz.uuid">
                <td style="max-width: 130px">{{ pvz.id }}</td>
                <td style="max-width: 150px">
                  <div class="mx-1 overflow-x-auto">
                    {{ pvz.address }}
                  </div>
                </td>
                <td style="max-width: 20px">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="selectPVZ(pvz)"
                    :disabled="addingPVZ"
                  >
                    Добавить
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

  <ffWildberriesSelectPointModal
    v-if="modalOpen"
    :state="modalOpen"
    :pickpoints="pickpoints"
    @callback="handleAddress"
    @close="closeModal"
  />
  <StaticConfirmModal
    title="Подтвердите действие"
    description="Вы действительно хотите удалить все пвз"
    v-model:state="confirmModal"
    :confirmFunction="deleteAllPVZs"
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
