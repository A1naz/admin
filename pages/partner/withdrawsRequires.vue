<script setup lang="ts">
import Paginator from 'primevue/paginator'
import { notify } from '@kyvg/vue3-notification'

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

async function getUsers(searchValue: string = '') {
  if (searchValue.length > 1) {
    curPage.value = 1
  }
  const { data }: any = await useFetch('/api/partner/getWithdraws', {
    method: 'GET',
    params: {
      page: curPage.value,
    },
  })

  withdrawsCount.value = data.value.withdrawsCount
  withdraws.value = data.value.withdraws
  pages.value = Math.ceil(withdrawsCount.value / elPerPage)
}

await getUsers()

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
  await getUsers()
  isPageBtnsDisabled.value = false
}
async function onInput(event: Event) {
  findSearchQueryDebounced()
}

const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '' && query.value.length > 0) {
    return
  }
  inputLoading.value = true
  await getUsers(query.value)
  inputLoading.value = false
}
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

function openReferralModal(user: any) {
  selectedUser.value = user
}

async function getReferralsInfo() {
  const { data } = await useFetch('/api/partner/getReferralsInfo', {
    method: 'GET',
    params: {
      userId: selectedUser.value.uuid,
    },
  })
  if (data.value) {
    referrals.value = data.value
    filteredReferrals.value = data.value
  }
}

async function openOptionsModal(user: any) {
  selectedUser.value = user
  referralModalLoading.value = true
  await getReferralsInfo()
  referralModalLoading.value = false
}

function searchReferrals(searchValue: string) {
  console.log(searchValue)

  filteredReferrals.value = referrals.value.filter(
    (el: any) =>
      el.username.includes(searchValue) ||
      el.email.includes(searchValue) ||
      el.uuid.includes(searchValue)
  )
  console.log(filteredReferrals.value)
}
</script>

<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Управление партнерами</h1>
  <PartnerDivider />
  <div class="divider"></div>
  <div class="flex w-full justify-between">
    <div>
      <!-- <label tabindex="10"
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
      /> -->
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
    :style="{ 'max-height': height - 250 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>userId</th>
          <th>FIO</th>
          <th>type</th>
          <th>card</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="withdraw in withdraws" class="hover">
          <th style="max-width: 300px; min-width: 250px">
            {{ withdraw.userUuid }}
          </th>
          <th style="max-width: 300px; min-width: 250px">
            {{ withdraw.details.fio }}
          </th>
          <th style="max-width: 300px; min-width: 250px">
            {{ withdraw.type }}
          </th>
          <th style="width: 190px" class="flex">
            {{ withdraw.details.card }}
          </th>
          <th>
            <label
              for="referral_withdraw_close_modal"
              class="btn btn-primary btn-sm"
              @click=""
              >Закрыть</label
            >
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
