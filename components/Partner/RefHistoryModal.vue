<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props: any = defineProps({
  referral: Object,
  loading: Boolean,
})

const isPageBtnsDisabled = ref(false)
const curPage = ref(1)
const sortDateType = ref('registrationDate')
const dateSortIcon = ref('mdi-arrow-down')
const referral: any = toRef(props, 'referral')
const loading = toRef(props, 'loading')
const inputLoading = ref(false)
const referralsHistory = ref<any>([])

async function getReferralHistory() {
  const { data } = await useFetch('/api/partner/getReferralHistory', {
    method: 'GET',
    params: {
      refId: referral.value._id,
      sortType: sortDateType.value,
      sort: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      page: curPage.value,
    },
  })
  if (data.value) {
    referralsHistory.value = data.value
  }
}

async function swapPage(destination: number) {
  if (destination < 0 && curPage.value <= 1) return

  curPage.value += destination
  isPageBtnsDisabled.value = true
  await getReferralHistory()
  isPageBtnsDisabled.value = false
}

defineExpose({ getReferralHistory })

function sortByDate(sortType: string) {
  sortDateType.value = sortType

  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getReferralHistory()
}
</script>

<template>
  <input type="checkbox" id="ref_history_modal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box w-9/12 max-w-full">
      <form method="dialog">
        <label
          for="ref_history_modal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </label>
      </form>
      <div class="my-2 ml-5">История пользователя: {{ referral.username }}</div>
      <div v-if="loading" class="hero">
        <span class="loading loading-dots loading-lg my-2"></span>
      </div>

      <div class="overflow-x-auto" v-else-if="!loading">
        <div class="flex justify-end">
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
        <div v-if="referralsHistory.length > 0">
          <span
            v-if="inputLoading"
            class="loading loading-spinner text-primary loading-large ml-4"
          />
        </div>
        <div v-else>
          <h1 class="hero text-xl font-bold ml-5 my-2"></h1>
        </div>
        <div
          class="mb-2 mt-0 mx-2 overflow-y-auto"
          :style="{ 'max-height': 500 + 'px' }"
        >
          <table class="table my-3" v-if="referralsHistory.length > 0">
            <!-- head -->
            <thead>
              <tr>
                <th>id операции</th>
                <th>
                  <div
                    @click="sortByDate('amount')"
                    class="flex cursor-pointer"
                    style="width: 110px"
                  >
                    комиссионные
                    <Icon
                      v-if="sortDateType == 'amount'"
                      class="swap-on fill-current ml-1 w-6 h-5"
                      :name="dateSortIcon"
                    />
                  </div>
                </th>
                <th>тип</th>
                <th>
                  <div
                    @click="sortByDate('date')"
                    class="flex cursor-pointer"
                    style="width: 110px"
                  >
                    дата операции
                    <Icon
                      v-if="sortDateType == 'date'"
                      class="swap-on fill-current ml-1 w-6 h-5"
                      :name="dateSortIcon"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover" v-for="history in referralsHistory">
              
                <td>{{ history.serviceID }}</td>
                <td>{{ history.amount }}</td>
                <td>{{ history.serviceType }}</td>
                <td>{{ history.date.split('T')[0] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-action"></div>
    </div>
    <label class="modal-backdrop cursor-pointer" for="ref_history_modal"
      >Close</label
    >
  </div>
</template>
<style scoped>
::-webkit-scrollbar {
  height: 0px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
}
</style>
