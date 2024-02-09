<script lang="ts" setup>
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Товары готовые к выдаче',
})

import { notify } from '@kyvg/vue3-notification'
const store = useMainStore()
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
  const { data } = await useFetch('/api/delivery/exportReady', {
    responseType: 'blob',
    watch: false,
    method: 'GET',
    params: {
      uuid: selectedUser.value.uuid,
    },
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Готовы к выдаче.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}
async function exportXLS() {
  const { data, error } = await useFetch('/api/delivery/export', {
    responseType: 'blob',
    watch: false,
    method: 'GET',
    params: {
      uuid: selectedUser.value.uuid,
    }
}
)
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось экспортировать данные',
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
    <selectUserModal @selectUser=";[(selectedUser = $event)]" />
    <div class="export">
      <div class="dropdown dropdown-end z-10">
        <button tabindex="0" class="btn btn-sm btn-primary m-1" :disabled="selectedUser.username === ''">Экспорт</button>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <NuxtLink target="blank" :to="`/delivery/export?uuid=${selectedUser.uuid}`">
              Готовы к выдаче PDF
            </NuxtLink>
          </li>
          <li><a @click="exportReadyXLS">Готовы к выдаче Excel</a></li>

          <li><a @click="exportXLS">Общая таблица Excel</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
