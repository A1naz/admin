<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Клиенты',
})

import { notify } from '@kyvg/vue3-notification'
const store = useMainStore()
const { height } = useWindowSize()
const config = useRuntimeConfig()
const publicUrl = config.public.siteUrl
const confirmModal = ref(false)

if (!store.client.mainAdmin && !store.client.tabs.includes('клиенты')) {
  navigateTo('/partner')
}

const filtersForm = ref({
  dateRange: [],
  startDate: new Date(Date.now() + 1000 * 60 * 5),
  status: 'all',
  searchQuery: '',
  page: 1,
  clientsType: 'all',
})

const tariffs = ref<any>([])
const adjustTariffModal = ref(false)

const selectedUser = ref<any>({})
const selectedUserForStats = ref<any>({})
const infoModal = ref(false)
const statsModal = ref(false)

async function getClients() {
  tariffs.value = []
  const { data }: any = await useFetch('/api/clientsInfo/get', {
    method: 'GET',
    query: filtersForm.value,
    watch: false,
  })
  tariffs.value = data.value
}

setTimeout(() => getClients(), 300)

const findDebounced = useDebounceFn(getClients, 300)
watch(filtersForm.value, findDebounced)

const openTariffInfo = (tariff: any) => {
  selectedUser.value = tariff
  infoModal.value = true
}
const openUserStats = (tariff: any) => {
  selectedUserForStats.value = tariff
  statsModal.value = true
}

async function signTariff() {
  const { data }: any = await useFetch('/api/docs/signDoc', {
    method: 'POST',
    params: {
      uuid: selectedUser.value.uuid,
    },
  })
  if (data.value) {
    notify({
      title: 'Внимание',
      text: 'Документ подписан',
    })
    getClients()
  }
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-3 my-2">Клиенты</h1>
  <div class="ml-3 mb-2 mt-5 flex justify-between">
    <div class="mr-10 flex gap-3">
      <div>
        <DateRangePicker
          v-model="filtersForm.dateRange"
          :start-date="filtersForm.startDate"
          @reset="filtersForm.dateRange = []"
        >
          <button class="btn btn-neutral">
            <Icon name="material-symbols:calendar-month-outline" size="26" />
          </button>
        </DateRangePicker>
      </div>
      <button
        class="btn -ml-3"
        @click="filtersForm.dateRange = []"
        v-if="filtersForm.dateRange.length"
      >
        <Icon name="material-symbols:close" size="26" />
      </button>
      <select class="select select-bordered w-50" v-model="filtersForm.status">
        <option value="all">Все</option>
        <option value="registered">Зарегистрированные</option>
        <option value="active">Активные</option>
        <option value="inactive">Неактивные</option>
      </select>

      <label class="flex">
        <input
          v-model="filtersForm.searchQuery"
          type="text"
          placeholder="Логин, наименование, номер телефона"
          class="input input-bordered w-60 -mr-[55px]"
        />

        <button class="btn btn-ghost">
          <Icon name="material-symbols:search" size="20" />
        </button>
      </label>
      <select
        class="select select-bordered ml-3"
        v-model="filtersForm.clientsType"
      >
        <option disabled>Тип пользователя</option>
        <option selected value="all">Все пользователи</option>
        <option value="fizFace">Физ. лицо</option>
        <option value="yurFace">Юр. лицо</option>
      </select>
      <div class="join mr-2">
        <button
          class="join-item btn"
          @click="filtersForm.page -= 1"
          :disabled="filtersForm.page <= 1"
        >
          «
        </button>
        <button class="join-item btn">{{ filtersForm.page }}</button>
        <button class="join-item btn" @click="filtersForm.page += 1">»</button>
      </div>
    </div>
  </div>

  <div
    class="mt-6 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>Логин</th>
          <th>Статус</th>
          <th>Организация</th>
          <th>Дата регистрации</th>
          <th>Договор</th>
          <th>Реферал</th>
          <th>Детали</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover" v-for="tariff in tariffs">
          <th style="max-width: 80px; min-width: 70px" class="overflow-x-auto">
            {{ tariff.login }}
          </th>
          <th style="max-width: 80px; min-width: 70px" class="overflow-x-auto">
            {{ tariff.faceType }}
          </th>
          <th
            style="max-width: 300px; min-width: 140px"
            class="overflow-x-auto"
          >
            {{ tariff.orgName }}
          </th>
          <th
            style="max-width: 300px; min-width: 140px"
            class="overflow-x-auto"
          >
            {{ tariff.registrationDate.slice(0, 10).replace(/-/g, '.') }}
          </th>

          <th style="max-width: 55px; min-width: 50px" class="overflow-x-auto">
            <a
              target="_blank"
              v-if="tariff.isDocumentSigned"
              :href="`${publicUrl}/api/docs/get?uuid=${tariff.uuid}`"
              class="link link-primary"
              >Скачать документ</a
            >
            <span v-else>Не заполнены данные</span>
          </th>

          <th style="max-width: 80px; min-width: 70px" class="overflow-x-auto">
            {{ tariff.isUserReferral }}
          </th>

          <th class="flex">
            <button class="btn btn-neutral" @click="openTariffInfo(tariff)">
              Информация
            </button>
            <button
              class="btn btn-square btn-neutral ml-2"
              @click="openUserStats(tariff)"
            >
              <Icon name="mdi:eye-outline" size="20" />
            </button>
          </th>
        </tr>
      </tbody>
    </table>
  </div>

  <UserInfoModal
    v-model:is-modal-open="infoModal"
    :selectedUser="selectedUser"
  />
  <UserStatsModal
    v-model:is-modal-open="statsModal"
    :selectedUser="selectedUserForStats"
  />
  <StaticConfirmModal
    :title="'Подтвердить действие'"
    :description="'Вы уверены, что хотите подписать документ?'"
    :confirmFunction="signTariff"
    v-model:state="confirmModal"
  />
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
