<script lang="ts" setup>
const { width, height } = useWindowSize()
import { notify } from '@kyvg/vue3-notification'
import { relative } from 'path'
import { Bar } from 'vue-chartjs'
const currency = useCurrency()

const secondLevelReferrals = ref(0)
const route = useRoute()
const router = useRouter()
const status = computed(() => route.query?.status || 'all')
const periodFromRoute = route.query.period
const lastElements = ref<any>([])

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Аналитика',
})

let chartDataValue = ref<any>([])
const services = ref<any>([])
let chartLabels = ref<any>([])
const buyoutsCount = ref<any>({
  all: 0,
  inAdvertisement: 0,
})
const deliveriesCount = ref<any>({
  all: 0,
  active: 0,
  complited: 0,
  penalty: 0,
})
async function getData() {
  const { data, error }: any = await useFetch('/api/stats/stats', {
    method: 'GET',
    params: {
      type: route.query.type,
      period: route.query.period,
    },
  })
  if (data.value) {
    chartDataValue.value = data.value.data
    chartLabels.value = data.value.labels
    services.value = data.value.services
  }
}

async function getLast() {
  const { data, error }: any = await useFetch('/api/stats/last10', {
    method: 'GET',
  })

  if (data.value) {
    lastElements.value = data.value
  }
}

async function countBuyouts() {
  const { data, error }: any = await useFetch('/api/stats/buyoutsCount', {
    method: 'GET',
  })
  if (data.value) {
    buyoutsCount.value = data.value
  }
}

async function coutDeliveries() {
  const { data, error }: any = await useFetch('/api/stats/deliveriesCount', {
    method: 'GET',
  })
  if (data.value) {
    deliveriesCount.value = data.value
  }
}

const withdrawsCount = ref(0)
async function getSecondLevelReferrals() {
  const { data }: any = await useFetch('/api/partner/getSecondLevelReferrals', {
    method: 'GET',
  })
  if (data.value && data.value.status === 'ok') {
    secondLevelReferrals.value = data.value.secondLevelReferralsCount
  }
}
async function getPatnerWithdraws() {
  const { data }: any = await useFetch('/api/stats/getPartnerWithdraws', {
    method: 'GET',
  })
  if (data.value) {
    withdrawsCount.value = data.value.withdrawsCount
  }
}

// await getPatnerWithdraws()
// await getSecondLevelReferrals()

// await coutDeliveries()
// await getData()
// await getLast()
// await countBuyouts()

const store = useMainStore()

const colorMode = useColorMode()
const chardColor = computed(() =>
  colorMode.value === 'light' ? '#570df8' : '#a469f7'
)

const selectedService: any = ref({
  value: 'all',
  title: 'Все',
  expenses: 55452,
  quantity: 495,
})

const barThickness = computed(() => {
  if (width.value > 768) {
    return 30
  } else {
    return 10
  }
})

const type = route.query.type ? route.query.type : ''
const chartBar: any = ref(null)
const chartData = ref({
  labels: chartLabels.value,
  datasets: [
    {
      barPercentage: 1.3,
      maxBarThickness: 33,
      borderRadius: 7,
      minBarLength: 0,
      label: '',
      data: chartDataValue,
      backgroundColor: chardColor.value,
    },
  ],
})
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: true,
  borderWidth: 1,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || ''

          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'RUB',
            }).format(context.parsed.y)
          }
          return label
        },
      },
    },
  },
})

function selectPeriod(event: any) {
  navigateTo(`/stats?type=${route.query.type}&period=${event.target.value}`, {
    external: true,
  })
}

function selectService(event: any) {
  navigateTo(`/stats?type=${event.target.value}&period=${route.query.period}`, {
    external: true,
  })
}

if (!route.query.type || !route.query.period) {
  navigateTo('/stats?type=all&period=today', {
    external: true,
  })
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Аналитика</h1>
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/stats">Аналитика</NuxtLink>
      </li>
      <!-- <li>
                    <NuxtLink to="/partner/management">Управление партнерами</NuxtLink>
                </li> -->
    </ul>
  </div>
  <div class="flex justify-between mb-4 items-center mt-6">
    <div class="hidden lg:block">
      <!-- <NuxtLink
        @click="selectedService = service"
        v-for="service in services"
        :to="`/stats?type=${service.value}&period=${route.query.period}`"
        :external="true"
        :class="{
          'btn-active': route.query.type === service.value,
        }"
        class="btn btn-ghost btn-sm normal-case font-medium"
      >
        {{ service.title }}
      </NuxtLink> -->
    </div>
    <select
      class="select select-bordered select-sm"
      @change="selectPeriod($event)"
    >
      <option value="today" :selected="route.query.period === 'today'">
        Сегодня
      </option>
      <option value="yesterday" :selected="route.query.period === 'yesterday'">
        Вчера
      </option>
      <option value="week" :selected="route.query.period === 'week'">
        Неделя
      </option>
      <option value="month" :selected="route.query.period === 'month'">
        Этот месяц
      </option>
      <option value="lastMonth" :selected="route.query.period === 'lastMonth'">
        Прошлый месяц
      </option>
      <option value="thisYear" :selected="route.query.period === 'thisYear'">
        Этот год
      </option>
      <option value="lastYear" :selected="route.query.period === 'lastYear'">
        Прошлый год
      </option>
    </select>
    <select
      class="select select-bordered select-sm lg:hidden"
      @change="selectService($event)"
    >
      <option
        v-for="service in services"
        :value="service.value"
        :selected="route.query.type === service.value"
      >
        {{ service.title }}
      </option>
    </select>
  </div>
  <div>
    <div class="flex gap-5 flex-wrap">
      <div class="flex flex-col md:flex md:flex-row md:flex-wrap">
        <div id="forBar" class="w-11/12 md:w-1/2 mt-10 h-full">
          <Bar
            id="chartId"
            :data="chartData"
            :options="chartOptions"
            ref="chartBar"
          />
        </div>
      </div>
    </div>
  </div>
  <div class="h-24"></div>
</template>

<style scoped></style>
