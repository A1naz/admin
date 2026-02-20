<script lang="ts" setup>
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Товары готовые к выдаче',
})

import { notify } from '@kyvg/vue3-notification'
const store = useMainStore()
const selectedUsers = ref([])
const selectedPVZs = ref([])
const isButtonsDisabled = ref(false)
const isAllPVZSelected = ref(false)
const selectedDays = ref('all')

const selectedUser = ref<any>({
  username: '',
})

if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('товары готовые к выдаче')
) {
  navigateTo('/partner')
}

async function exportReadyXLS() {
  isButtonsDisabled.value = true
  const { data } = await useFetch('/api/zy/delivery/exportReady', {
    responseType: 'blob',
    watch: false,
    method: 'GET',
    params: {
      uuid: selectedUsers.value.map((el: any) => el.uuid),
      selectedDays: selectedDays.value,
      pvzs: isAllPVZSelected.value
        ? []
        : selectedPVZs.value.map((el: any) => el.address),
    },
  })
  isButtonsDisabled.value = false
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Готовы к выдаче.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}
async function exportXLS() {
  if (selectedPVZs.value.length == 0 && !isAllPVZSelected.value) {
    notify({
      type: 'error',
      title: 'Ошибка',
      text: 'Не выбрано ни одного ПВЗ',
    })
    return
  }

  isButtonsDisabled.value = true
  const { data, error }: any = await useFetch(
    '/api/zy/delivery/export',
    {
      responseType: 'blob',
      method: 'GET',
      params: {
        uuid: selectedUsers.value.map((el: any) => el.uuid),
        pvzs: isAllPVZSelected.value
          ? []
          : selectedPVZs.value.map((el: any) => el.address),
      },
      watch: false,
    }
  )
  isButtonsDisabled.value = false
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось экспортировать данные',
    })
    return
  }

  if (data.value && data.value.status == 'error') {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: data.value.message,
    })
    return
  }

  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Общая таблица.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}

function selectAllPVZ() {
  isAllPVZSelected.value = !isAllPVZSelected.value
}

function clearSelectedPVZ() {
  selectedPVZs.value = []
}

watch(selectedUsers.value, () => {
  clearSelectedPVZ()
})

const mpStore = useMPStore()

function changeMP(event: any) {
  if (event.target.value !== 'zy') {
    return navigateTo('/delivery/' + event.target.value)
  }
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">
    Товары готовые к выдаче Золотое Яблоко
  </h1>
  <div class="divider"></div>
  <div class="flex gap-1 items-center">
    <!-- <selectUserModal @selectUser=";[(selectedUser = $event)]" /> -->
    <ModalManyUsers :selectedUsers="selectedUsers" />
    <ModalGoldAppleManyPVZs
      @selectAllPVZ="selectAllPVZ"
      :selectedAll="isAllPVZSelected"
      :selectedUsers="selectedUsers"
      :selectedPVZs="selectedPVZs"
    />
    <div class="export">
      <div class="dropdown dropdown-end z-10">
        <button
          tabindex="0"
          class="btn btn-sm btn-primary m-1"
          :disabled="!selectedUsers.length || isButtonsDisabled"
        >
          Экспорт
        </button>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <button class="btn btn-ghost" :disabled="isButtonsDisabled">
            <NuxtLink
              target="blank"
              :to="`/delivery/export?uuid=${JSON.stringify(selectedUsers.map((el: any) => el.uuid))}&pvzs=${JSON.stringify(isAllPVZSelected ? [] : selectedPVZs.map((el: any) => el.address))}`"
            >
              Готовы к выдаче PDF
            </NuxtLink>
          </button>
          <button
            class="btn btn-ghost"
            @click="exportReadyXLS"
            :disabled="isButtonsDisabled"
          >
            Готовы к выдаче Excel
          </button>
          <button
            class="btn btn-ghost"
            @click="exportXLS"
            :disabled="isButtonsDisabled"
          >
            Общая таблица Excel
          </button>
        </ul>
      </div>
    </div>
    <select
      class="select select-bordered max-w-xs mb-2"
      @change="($event) => changeMP($event)"
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

    <select class="select select-bordered max-w-xs mb-2" v-model="selectedDays">
      <option value="all" selected>Все дни</option>
      <option value="3">Прошло 3 дня</option>
      <option value="7">Прошло 7 дней</option>
      <option value="10">Прошло 10 дней</option>
    </select>
  </div>
</template>
