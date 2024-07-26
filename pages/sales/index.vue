<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Продажи',
})
const currency = useCurrency()
const store = useMainStore()
const { height, width } = useWindowSize()

if (!store.client.mainAdmin && !store.client.tabs.includes('продажи')) {
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

const tariffInfoModal = ref(false)
const editPaymentsModal = ref(false)
const selectedTariff = ref<any>({})
const editStatus = ref('accepted')

function selectUser(user: any) {
  selectedUser.value = user

  adjustTariffModal.value = true
}

async function getTariffs() {
  const { data }: any = await useFetch('/api/sales/payments', {
    method: 'GET',
    query: filtersForm.value,
    watch: false,
  })
  console.log(data.value)

  tariffs.value = data.value
}
setTimeout(() => getTariffs(), 300)

const findDebounced = useDebounceFn(getTariffs, 300)
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
  <h1 class="text-2xl font-bold ml-3 my-2">Оплата тарифов</h1>
  <div class="ml-3 mb-2 mt-5 flex justify-between">
    <div class="mr-10 flex gap-3">
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
      <DateRangePicker
        v-model="filtersForm.dateRange"
        :start-date="filtersForm.startDate"
        @reset="filtersForm.dateRange = []"
      >
        <button class="btn btn-neutral">
          <Icon name="material-symbols:calendar-month-outline" size="26" />
        </button>
      </DateRangePicker>
    </div>
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
  <div
    class="mt-6 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>Дата</th>
          <th>Логин</th>
          <th>Наименование</th>
          <th>ФИО</th>
          <th>Номер телефона</th>
          <th>Почта</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover" v-for="tariff in tariffs">
          <th style="max-width: 80px; min-width: 70px">
            {{ tariff.id }}
          </th>
          <th
            style="max-width: 300px; min-width: 140px"
            class="overflow-x-auto"
          >
            {{ tariff.orgName }}
          </th>
          <th style="max-width: 80px; min-width: 70px" class="overflow-x-auto">
            {{ tariff.username }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.mp }}
          </th>

          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.paket }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ currency.format(tariff.price) }}
          </th>
          <th style="max-width: 100px; min-width: 90px">
            {{ tariff.createdAt.slice(0, 10).replace(/-/g, '.') }}
          </th>

          <!-- <th
            style="max-width: 100px; min-width: 90px"
            class="flex justify-center"
          >
            <button>
              <Icon
                name="mdi:account"
                size="30"
                color="#d0cfd8"
                @click=";[(selectedTariff = tariff), (tariffInfoModal = true)]"
              />
            </button>
            <button class="ml-2">
              <Icon
                name="el:ok"
                size="30"
                color="#d0cfd8"
                @click="
                  ;[
                    (editPaymentsModal = true),
                    (selectedTariff = tariff),
                    (editStatus = 'accepted'),
                  ]
                "
              />
            </button>
            <button class="ml-2">
              <Icon
                name="ic:round-cancel"
                size="30"
                color="#d0cfd8"
                @click="
                  ;[
                    (editPaymentsModal = true),
                    (selectedTariff = tariff),
                    (editStatus = 'rejected'),
                  ]
                "
              />
            </button>
          </th> -->
        </tr>
      </tbody>
    </table>
  </div>

  <TariffPlansAdjustTariffModal
    v-model:is-modal-open="adjustTariffModal"
    @getTariffs="getTariffs"
    :selectedUser="selectedUser"
  />

  <TariffPaymentsInfoModal
    v-model:is-modal-open="tariffInfoModal"
    :selectedTariff="selectedTariff"
  />
  <tariffPaymentsEditModal
    v-model:is-modal-open="editPaymentsModal"
    :selectedTariff="selectedTariff"
    :status="editStatus"
    :getTariffs="getTariffs"
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
