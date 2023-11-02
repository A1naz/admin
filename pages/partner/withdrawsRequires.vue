<script setup lang="ts">
import Paginator from 'primevue/paginator'
import { notify } from '@kyvg/vue3-notification'

const partnerStore = usePartnerStore()
const { height, width } = useWindowSize()
const withdraws = ref<any>([])
const withdrawsCount = ref(0)
const elPerPage = 25
const pages = ref(0)
const inputLoading = ref(false)
const curPage = ref(1)
const isPageBtnsDisabled = ref(false)
const query = ref('')
const selectedUser = ref<any>({})
const referralModalLoading = ref(false)
const referrals = ref<any>([])
const filteredReferrals = ref<any>([])

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

async function getWithdraws(searchValue: string = '') {
  if (searchValue.length > 1) {
    curPage.value = 1
  }
  const { data }: any = await useFetch('/api/partner/getWithdraws', {
    method: 'GET',
    params: {
      page: curPage.value,
      searchValue: query.value,
    },
  })

  withdrawsCount.value = data.value.withdrawsCount
  withdraws.value = data.value.withdraws
  pages.value = Math.ceil(withdrawsCount.value / elPerPage)
}

await getWithdraws()

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
  await getWithdraws()
  isPageBtnsDisabled.value = false
}

async function closeWithdraw(id: string) {
  const { data }: any = await useFetch('/api/partner/closeWithdraw', {
    method: 'POST',
    params: {
      withdrawId: id,
    },
  })

  if (data.value) {
    withdraws.value.forEach((el: any, i: any) => {
      if (el._id === id) {
        el.isClosed = true
        el.isCancelled = false
      }
    })
    notify({
      type: 'success',
      title: 'Выплата закрыта',
    })
    partnerStore.quantity--
  }
}

async function cancelWithdraw(id: string) {
  const { data }: any = await useFetch('/api/partner/cancelWithdraw', {
    method: 'POST',
    params: {
      withdrawId: id,
    },
  })

  if (data.value) {
    withdraws.value.forEach((el: any, i: any) => {
      if (el._id === id) {
        el.isClosed = false
        el.isCancelled = true
      }
    })

    notify({
      type: 'success',
      title: 'Выплата отменена',
    })

    partnerStore.quantity--
  }
}

async function returnWithdraw(id: string) {
  const { data }: any = await useFetch('/api/partner/returnWithdraw', {
    method: 'POST',
    params: {
      withdrawId: id,
    },
  })

  withdraws.value.forEach((el: any, i: any) => {
    if (el._id === id) {
      el.isClosed = false
      el.isCancelled = false
    }
  })

  if (data.value) {
    notify({
      type: 'success',
      title: 'Выплата возвращена',
    })

    partnerStore.quantity++
  }
}

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '' && query.value.length > 0) {
    return
  }
  inputLoading.value = true
  await getWithdraws(query.value)
  inputLoading.value = false
}
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

const store = useMainStore()

if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('управление партнеркой')
) {
  navigateTo('/waitingRoom')
}
</script>

<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Партнерская программа</h1>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li><NuxtLink to="/partner">Партнерская программа</NuxtLink></li>
      <li>
        <NuxtLink to="/partner/withdrawsRequires">Запросы выплат</NuxtLink>
      </li>
    </ul>
  </div>
  <PartnerDivider />
  <div class="divider"></div>
  <div class="flex w-full justify-between">
    <div>
      <label tabindex="10"
        ><input
          v-model="query"
          type="text"
          placeholder="Поиск"
          class="input input-bordered input-l ml-4"
          @input="onInput($event)"
        />
      </label>
      <span
        v-if="inputLoading"
        class="loading loading-spinner text-primary loading-large ml-4"
      />
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
          <th>ID</th>
          <th>userId</th>
          <th>ФИО</th>
          <th>Тип</th>
          <th>сумма</th>
          <th>карта</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="withdraw in withdraws" class="hover">
          <th style="max-width: 300px; min-width: 250px">
            {{ withdraw._id }}
          </th>
          <th style="max-width: 300px; min-width: 250px">
            {{ withdraw.userUuid }}
          </th>
          <th
            style="max-width: 300px; min-width: 250px"
            class="overflow-x-auto"
          >
            {{ withdraw.details.fio }}
          </th>
          <th style="max-width: 80px; min-width: 75px">
            {{ withdraw.type == 'card' ? 'Карта' : 'Аккаунт' }}
          </th>
          <th style="max-width: 80px; min-width: 75px">
            {{ withdraw.amount }} ₽
          </th>
          <th style="max-width: 180px; min-width: 170px">
            {{ withdraw.details.card }}
          </th>
          <th style="width: 200px">
            <div class="my-5" v-if="withdraw.isClosed || withdraw.isCancelled">
              <label
                for="referral_withdraw_close_modal"
                class="btn btn-info btn-sm"
                @click="returnWithdraw(withdraw._id)"
                >Отменить</label
              >
            </div>
            <div v-if="!withdraw.isCancelled && !withdraw.isClosed">
              <label
                for="referral_withdraw_close_modal"
                class="btn btn-primary btn-sm"
                @click="closeWithdraw(withdraw._id)"
                >Закрыть выплату</label
              >

              <label
                for="referral_withdraw_close_modal"
                class="btn bg-red-400 btn-sm my-1"
                @click="cancelWithdraw(withdraw._id)"
                >Отменить выплату</label
              >
            </div>
          </th>
        </tr>
      </tbody>
    </table>
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
