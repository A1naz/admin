<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'История действий пользователя',
})

import { notify } from '@kyvg/vue3-notification'
const { height, width } = useWindowSize()

const data = ref<any>([])

const editModal = ref(false)
const selectedWithdraw = ref<any>({})

const isPageBtnsDisabled = ref(false)
const curPage = ref(1)
const pages = ref(5000)

async function getData() {
  data.value = []
  const { data: res, error } = await useFetch('/api/balanceWithdraw/get', {
    method: 'GET',
    params: {
      page: curPage.value,
    },
  })

  data.value = res.value
}

const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('вывод с баланса')) {
  navigateTo('/partner')
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
  getData()
  isPageBtnsDisabled.value = false
}
getData()

function getStatusText(status: string) {
  switch (status) {
    case 'created':
      return 'Активный'
    case 'completed':
      return 'Завершен'
    case 'work':
      return 'В работе'
    case 'canceled':
      return 'Отменен'
  }
}
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Вывод с баланса</h1>
    <div class="card p-fluid"></div>

    <div class="divider"></div>
    <div class="w-full flex justify-end">
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
            <th>Логин</th>
            <th>Номер</th>
            <th>Почта</th>
            <th>Сумма к выводу</th>
            <th>ИНН/Карта</th>
            <th>Дата заявки</th>
            <th>Дата исполнения</th>
            <th>Статус</th>
            <th>Управление</th>
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr v-for="info in data" class="hover">
            <th style="max-width: 80px; min-width: 70px">
              {{ info.username }}
            </th>
            <th style="max-width: 80px; min-width: 70px">
              {{ info.userPhoneNumber }}
            </th>
            <th
              style="max-width: 180px; min-width: 70px"
              class="overflow-x-auto"
            >
              {{ info.userEmail }}
            </th>
            <th style="max-width: 40px; min-width: 40px">{{ info.amount }}</th>
            <th
              style="max-width: 180px; min-width: 70px"
              class="overflow-x-auto"
            >
              <p class="whitespace-nowrap">
                {{ info.type == 'INN' ? 'ИНН: ' : 'Карта: ' }} {{ info.info }}
              </p>
              <p>БИК: {{ info.cardInfo ? info.cardInfo.BIK : '' }}</p>
              <p>Р/С: {{ info.cardInfo ? info.cardInfo.RS : '' }}</p>
              <p>К/С: {{ info.cardInfo ? info.cardInfo.CS : '' }}</p>
              <p class="whitespace-nowrap">
                Банк: {{ info.cardInfo ? info.cardInfo.bankName : '' }}
              </p>
              <p class="whitespace-nowrap" v-if="info.type == 'INN'">
                Организация: {{ info.cardInfo ? info.cardInfo.orgName : '' }}
              </p>
              <p v-if="info.type == 'card'" class="whitespace-nowrap">
                ФИО: {{ info.cardInfo ? info.cardInfo.FIO : '' }}
              </p>
            </th>
            <th style="max-width: 40px; min-width: 40px">
              {{ info.date ? info.date.slice(0, 10) : '' }}
            </th>
            <th style="max-width: 80px; min-width: 70px">
              {{
                info.confirmationDate ? info.confirmationDate.slice(0, 10) : ''
              }}
            </th>
            <th style="max-width: 80px; min-width: 70px">
              {{ getStatusText(info.status) }}
            </th>
            <th style="max-width: 80px; min-width: 70px">
              <button
                class="btn btn-neutral"
                @click=";[(editModal = true), (selectedWithdraw = info)]"
              >
                <Icon name="material-symbols:edit" />
              </button>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
    <BalanceEditModal
      v-model:is-modal-open="editModal"
      :selectedWithdraw="selectedWithdraw"
      @getData="getData"
    />
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
