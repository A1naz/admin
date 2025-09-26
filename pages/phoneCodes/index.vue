
<script setup lang="ts">
const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('коды регистраций')
) {
  navigateTo('/partner')
}

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Коды регистраций',
})

import { notify } from '@kyvg/vue3-notification'
const { height } = useWindowSize()
const dateSortIcon = ref('mdi-arrow-down')
const elPerPage = 50
const curPage = ref(1)
const pages = ref(0)
const searchPhone = ref('')
const isPageBtnsDisabled = ref(false)
const codes = ref<any[]>([])
const codesCount = ref(0)

async function getCodes() {
  curPage.value = 1
  const { data }: any = await useFetch('/api/phoneCodes', {
    method: 'GET',
    params: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      phone: searchPhone.value,
    },
  })
  if (data.value) {
    codesCount.value = data.value.count
    codes.value = data.value.codes
    pages.value = Math.ceil(codesCount.value / elPerPage)
  }
}

const getCodesDebounced = useDebounceFn(getCodes, 1000)

watch(searchPhone, () => {
  getCodesDebounced()
})

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
  const { data }: any = await useFetch('/api/phoneCodes', {
    method: 'GET',
    params: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      phone: searchPhone.value,
    },
  })
  if (data.value) {
    codesCount.value = data.value.count
    codes.value = data.value.codes
    pages.value = Math.ceil(codesCount.value / elPerPage)
  }
  isPageBtnsDisabled.value = false
}

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getCodes()
}

getCodes()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Коды подтверждения по телефону</h1>
    <div class="card p-fluid"></div>

    <div class="divider"></div>
    <div class="flex justify-between">
      <div class="flex">
        <input
          v-model="searchPhone"
          type="text"
          placeholder="Поиск по номеру телефона"
          class="input input-bordered ml-2 w-60"
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
        <button class="join-item btn">{{ curPage }} из {{ pages }}</button>
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
            <th>Телефон</th>
            <th>Код</th>
            <th>
              <div @click="sortByDate" class="flex cursor-pointer">
                Дата
                <Icon
                  class="swap-on fill-current ml-1 w-6 h-5"
                  :name="dateSortIcon"
                />
              </div>
            </th>
            <th>Попыток</th>
            <th>Ошибок</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in codes" :key="item._id" class="hover">
            <td>{{ item.phone }}</td>
            <td>{{ item.code }}</td>
            <td>{{ new Date(item.date).toLocaleString() }}</td>
            <td>{{ item.count }}</td>
            <td>{{ item.errorCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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

