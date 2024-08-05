<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Тарифные планы',
})

const store = useMainStore()
const { height } = useWindowSize()

if (!store.client.mainAdmin && !store.client.tabs.includes('тарифные планы')) {
  navigateTo('/partner')
}

const filtersForm = ref({
  dateRange: [],
  startDate: new Date(Date.now() + 1000 * 60 * 5),
  status: 'registered',
  searchQuery: '',
  page: 1,
})

const tariffs = ref<any>([])
const adjustTariffModal = ref(false)

const selectedUser = ref<any>({
  username: '',
})


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
</script>
<template>
  <h1 class="text-2xl font-bold ml-3 my-2">Клиенты</h1>
  <div class="ml-3 mb-2 mt-5 flex justify-between">
    <div class="mr-10 flex gap-3">
      <DateRangePicker
        v-model="filtersForm.dateRange"
        :start-date="filtersForm.startDate"
        @reset="filtersForm.dateRange = []"
      >
        <button class="btn btn-neutral">
          <Icon name="material-symbols:calendar-month-outline" size="26" />
        </button>
      </DateRangePicker>
      <select class="select select-bordered w-50" v-model="filtersForm.status">
        <option value="registered">Зарегистрированные</option>
        <option value="active">Активные</option>
        <option value="inactive">Неактивные</option>
      </select>

      <label class="flex">
        <input
          v-model="filtersForm.searchQuery"
          type="text"
          placeholder="Логин, наименование"
          class="input input-bordered w-60 -mr-[55px]"
        />

        <button class="btn btn-ghost">
          <Icon name="material-symbols:search" size="20" />
        </button>
      </label>
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
          <th>Дата регистрации</th>
          <th>Логин</th>
          <th>Наименование</th>
          <th>Номер телефона</th>
          <th>Почта</th>
          <th>Детали</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover" v-for="tariff in tariffs">
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.registrationDate.slice(0, 10) }}
          </th>
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.login }}
          </th>
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.orgName }}
          </th>
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.phoneNumber }}
          </th>
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.email }}
          </th>
          <th style="max-width: 80px; min-width: 70px">
          
          </th>
          
        </tr>
      </tbody>
    </table>
  </div>

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
