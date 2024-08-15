<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лендинг',
})

const { height } = useWindowSize()

const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('лендинг')) {
  navigateTo('/partner')
}

const landingInfo = ref<any>([])
const dateRange = ref<any>([])
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))

async function getLandingInfo() {
  const { data, error }: any = await useFetch('/api/landingInfo/get', {
    method: 'GET',
    query: {
      dateRange: dateRange.value,
    },
    watch: false,
  })

  if (data.value) {
    landingInfo.value = data.value
  }
}

await getLandingInfo()
watch(dateRange, getLandingInfo)
</script>
<template>
  <h1 class="text-2xl font-bold ml-3 my-2">Лендинг</h1>
  <div class="flex">
    <DateRangePicker
      v-model="dateRange"
      :start-date="startDate"
      @reset="dateRange = []"
    >
      <button class="btn btn-neutral">
        <Icon name="material-symbols:calendar-month-outline" size="26" />
      </button>
    </DateRangePicker>
    <button class="btn" @click="dateRange = []" v-if="dateRange.length">
      <Icon name="material-symbols:close" size="26" />
    </button>
  </div>
  <div
    class="mt-6 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>Название лендинга</th>
          <th>Перешло пользователей</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover" v-for="info in landingInfo">
          <th style="max-width: 80px; min-width: 70px">
            {{ info.landing }}
          </th>
          <th style="max-width: 80px; min-width: 70px">
            {{ info.count }}
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
