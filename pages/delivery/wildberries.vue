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
  const { data } = await useFetch('/api/wildberries/delivery/exportReady', {
    responseType: 'blob',
    watch: false,
    method: 'GET',
    params: {
      uuid: selectedUsers.value.map((el: any) => el.uuid),
      pvzs: selectedPVZs.value.map((el: any) => el.address),
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
  isButtonsDisabled.value = true
  const { data, error }: any = await useFetch(
    '/api/wildberries/delivery/export',
    {
      responseType: 'blob',
      method: 'GET',
      params: {
        uuid: selectedUsers.value.map((el: any) => el.uuid),
        pvzs: selectedPVZs.value.map((el: any) => el.address),
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
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Товары готовые к выдаче</h1>
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/delivery">Товары готовые к выдаче</NuxtLink>
      </li>
    </ul>
  </div>
  <div class="divider"></div>
  <div class="flex gap-3 items-center">
    <!-- <selectUserModal @selectUser=";[(selectedUser = $event)]" /> -->
    <ModalManyUsers :selectedUsers="selectedUsers" />
    <ModalWildberriesManyPVZs
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
              :to="`/delivery/export?uuid=${JSON.stringify(selectedUsers.map((el: any) => el.uuid))}&pvzs=${JSON.stringify(selectedPVZs.map((el: any) => el.address))}`"
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
  </div>
</template>
