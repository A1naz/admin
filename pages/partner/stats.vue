<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const { height, width } = useWindowSize()
const users = ref<any>([])
const usersCount = ref(0)
const elPerPage = 25
const pages = ref(0)
const isPageBtnsDisabled = ref(false)
const inputLoading = ref(false)
const curPage = ref(1)
const referralModalRef: any = ref(false)
const query = ref('')
const sortDateType = ref('registrationDate')
const dateSortIcon = ref('mdi-arrow-down')
const referralsHistory = ref<any>([])
const selectedUser = ref<any>({
  username: '',
})
const loadingRefHistoryModal = ref(false)
const selectedReferral = ref<any>({
  username: '',
  _id: 0,
})
const referralModalLoading = ref(false)
const currency = useCurrency()
const stats = ref<any>()
const referrals = ref<any>([])
const filteredReferrals = ref<any>([])
const store = useMainStore()

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

async function swapPage(destination: number) {
  if (destination < 0 && curPage.value <= 1) return

  curPage.value += destination
  isPageBtnsDisabled.value = true
  await getRefStats()
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
  await getRefStats()
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

async function getRefStats() {
  stats.value = []
  const { data } = await useFetch('/api/partner/getRefStats', {
    method: 'GET',
    params: {
      userId: selectedUser.value._id,
      page: curPage.value,
      sort: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      sortType: sortDateType.value,
      searchValue: query.value.replaceAll(' ', ''),
    },
  })
  if (data.value) {
    stats.value = data.value
  }
}

if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('управление партнеркой')
) {
  navigateTo('/waitingRoom')
}

const selectUserClose: any = ref(null)
function openUsersSelectModal() {
  selectUserClose.value?.click()
}

async function selectUser(user: any) {
  selectedUser.value = user
  // getInfo()
  selectUserClose.value?.click()
}

function sortByDate(sortType: string) {
  sortDateType.value = sortType

  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getRefStats()
}

// async function getReferralHistory() {
//   const { data } = await useFetch('/api/partner/getReferralHistory', {
//     method: 'GET',
//     params: {
//       refId: selectedReferral.value.id,
//     },
//   })
//   if (data.value) {
//     referralsHistory.value = data.value
//   }
// }

async function openOptionsModal(user: any) {
  selectedReferral.value = user
  referralModalLoading.value = true
  setTimeout(async () => {
    await referralModalRef.value.getReferralHistory()
    referralModalLoading.value = false
  }, 200)
}
</script>

<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Партнерская программа</h1>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/partner">Управление партнерами</NuxtLink>
      </li>
      <li><NuxtLink to="/partner/stats">Статистика</NuxtLink></li>
    </ul>
  </div>
  <PartnerDivider />
  <div class="divider"></div>
  <div class="flex w-full justify-between">
    <!-- <div>
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
    </div> -->

    <div class="flex">
      <div>
        <selectUserModal
          @selectUser=";[(selectedUser = $event), getRefStats()]"
        />
      </div>
      <div v-if="selectedUser.username != ''">
        <label
          ><input
            v-model="query"
            type="text"
            placeholder="id/username/email реферала"
            class="input input-bordered input-l ml-2 w-80"
            @input="onInput($event)"
          />
        </label>
        <span
          v-if="inputLoading"
          class="loading loading-spinner text-primary loading-large ml-4"
        />
      </div>
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
          <th>id</th>
          <th>username</th>
          <th>email</th>
          <th>телеграм</th>
          <th>
            <div
              @click="sortByDate('refCount')"
              class="flex cursor-pointer"
              style="width: 110px"
            >
              рефералы
              <Icon
                v-if="sortDateType == 'refCount'"
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>

          <th>
            <div
              @click="sortByDate('totalSum')"
              class="flex cursor-pointer"
              style="width: 110px"
            >
              комиссионные
              <Icon
                v-if="sortDateType == 'totalSum'"
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>

          <th>
            <div
              @click="sortByDate('quantity')"
              class="flex cursor-pointer"
              style="width: 110px"
            >
              услуг
              <Icon
                v-if="sortDateType == 'quantity'"
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>% наград</th>
          <th>
            <div
              @click="sortByDate('registrationDate')"
              class="flex cursor-pointer"
              style="width: 130px"
            >
              дата регистрации
              <Icon
                v-if="sortDateType == 'registrationDate'"
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
          <th>история</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="stat in stats" class="hover">
          <td style="max-width: 150px">{{ stat.uuid }}</td>
          <td>
            <div class="mx-1 overflow-x-auto text-x">
              {{ stat.username }}
            </div>
          </td>
          <td class="overflow-x-auto text-xs">
            <div class="mx-1 overflow-x-auto">
              {{ stat.email }}
            </div>
          </td>
          <td class="overflow-x-auto text-x">
            <div class="mx-1 overflow-x-auto">
              {{ stat.telegram }}
            </div>
          </td>
          <td style="max-width: 50px" class="overflow-x-auto">
            <div class="mx-1 overflow-x-auto">
              {{ stat.refCount }}
            </div>
          </td>
          <td style="max-width: 50px" class="overflow-x-auto">
            <div class="mx-1 overflow-x-auto">
              {{ currency.format(stat.totalSum) }}
            </div>
          </td>
          <td style="max-width: 50px" class="overflow-x-auto">
            <div class="mx-1 overflow-x-auto">
              {{ stat.quantity }}
            </div>
          </td>
          <td style="max-width: 50px" class="overflow-x-auto">
            <div class="mx-1 overflow-x-auto">{{ stat.rewardPercent }}%</div>
          </td>
          <td style="max-width: 50px" class="overflow-x-auto">
            <div class="mx-1 overflow-x-auto">
              {{ stat.registrationDate.slice(0, 10) }}
            </div>
          </td>
          <td>
            <label
              for="ref_history_modal"
              @click="openOptionsModal(stat)"
              class="btn btn-primary btn-sm"
              >история</label
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <PartnerRefHistoryModal
    :loading="referralModalLoading"
    :referral="selectedReferral"
    ref="referralModalRef"
  />
</template>

<style scoped>
::-webkit-scrollbar {
  height: 4px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
}
</style>
