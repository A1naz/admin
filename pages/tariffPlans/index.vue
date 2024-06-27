<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Тарифные планы',
})

const store = useMainStore()

if (!store.client.mainAdmin && !store.client.tabs.includes('тарифные планы')) {
  navigateTo('/partner')
}
//---------------------------------------------------

const filtersForm = ref({
  dateRange: [],
  startDate: new Date(Date.now() + 1000 * 60 * 5),
  mp: 'all',
})

const adjustTariffModal = ref(false)

const selectedUser = ref<any>({
  username: '',
})

function selectUser(user: any) {
  selectedUser.value = user

  adjustTariffModal.value = true
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
          type="text"
          placeholder="Логин, наименование"
          class="input input-bordered w-60 -mr-[55px]"
        />

        <button class="btn btn-ghost">
          <Icon name="material-symbols:search" size="20" />
        </button>
      </label>
    </div>
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
