<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Тарифные планы',
})

const store = useMainStore()
const { height, width } = useWindowSize()

if (!store.client.mainAdmin && !store.client.tabs.includes('тарифные планы')) {
  navigateTo('/partner')
}
//---------------------------------------------------

const filtersForm = ref({
  dateRange: [],
  startDate: new Date(Date.now() + 1000 * 60 * 5),
  mp: 'all',
  searchQuery: '',
  page: 1,
})

const tariffs = ref<any>([])
const adjustTariffModal = ref(false)

const selectedUser = ref<any>({
  username: '',
})

function selectUser(user: any) {
  selectedUser.value = user

  adjustTariffModal.value = true
}

async function getTariffs() {
  const { data }: any = await useFetch('/api/tariffPlans/tariffs', {
    method: 'GET',
    query: filtersForm.value,
    watch: false,
  })
  tariffs.value = data.value
}
setTimeout(() => getTariffs(), 300)

const findDebounced = useDebounceFn(getTariffs, 500)
watch(filtersForm.value, findDebounced)

const getTariffName = (tariff: any) => {
  if (tariff == 'launch') return 'Запуск'
  if (tariff == 'increase') return 'Рост'
  if (tariff == 'support') return 'Поддержка'
}

const getTariffsType = (type: any) => {
  if (type == 'basic') return 'Базовый'
  if (type == 'full') return 'Под ключ'
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-3 my-2">Тарифные планы</h1>
  <div class="ml-3 mb-2 mt-5 flex justify-between">
    <div class="flex justify-between">
      <TariffPlansSelectUserModal @selectUser="selectUser" />
    </div>
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
      <select class="select select-bordered w-50" v-model="filtersForm.mp">
        <option value="all">Все маркетплейсы</option>
        <option value="wildberries">Wildberries</option>
        <option value="ozon">Ozon</option>
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
          <th>Ответственный</th>
          <th>Никнейм</th>
          <th>Наименование</th>
          <th>Создано</th>
          <th>Маркетплейс</th>
          <th>Тариф</th>
          <th>Услуга</th>
          <th>Срок</th>
          <th>Статус</th>
          <th>Утверждено</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover" v-for="tariff in tariffs">
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.adminName }}
          </th>
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.username }}
          </th>
          <th style="max-width: 300px; min-width: 140px">
            {{ tariff.userOrgName }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.createdAt.slice(0, 10).replace(/-/g, '.') }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.mp }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ getTariffName(tariff.tariff) }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ getTariffsType(tariff.type) }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.timeLimitMonths }} месяц(ев)
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.status }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.paymentDate.slice(0, 10).replace(/-/g, '.') }} -
            {{ tariff.activationDate.slice(0, 10).replace(/-/g, '.') }}
          </th>
          <th style="max-width: 100px; min-width: 90px"></th>
        </tr>
      </tbody>
    </table>
  </div>

  <TariffPlansAdjustTariffModal
    v-model:is-modal-open="adjustTariffModal"
    :selectedUser="selectedUser"
  />
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
