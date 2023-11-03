<script lang="ts" setup>
const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('аналитика')) {
  navigateTo('/partner')
}

const { width, height } = useWindowSize()
import { notify } from '@kyvg/vue3-notification'
import { Bar } from 'vue-chartjs'
const query = ref('')
const currency = useCurrency()
const chartDataVisible = ref(false)
const secondLevelReferrals = ref(0)
const route = useRoute()
const router = useRouter()
const topTitle = ref('top50Buyouts')
const top50Buyouts = ref<any>([])
const top50Articles = ref<any>([])
const top50pvz = ref<any>([])
const top50UsersByDeposit = ref<any>([])
const inputLoading = ref(false)
const selectedHeaders = ref<any>({
  value: 'top50Buyouts',
  headers: ['Артикул', 'Количество'],
  title: 'Топ 50 артикулов по выкупам',
})
const selectedTop = ref<any>([])
const periodFromRoute = route.query.period
const lastElements = ref<any>([])
const pieGraphData = ref<any>({
  data: [1, 1],
  labels: ['Активные', 'Неактивные'],
  allUsers: 2,
})

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Аналитика',
})

const findSearchQuery = async () => {
  inputLoading.value = true
  await getTop50()
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

let chartDataValue = ref<any>([])
const services = ref<any>([])
let chartLabels = ref<any>([])

async function getData() {
  services.value = []

  const { data, error }: any = await useFetch('/api/stats/income', {
    method: 'GET',
    params: {
      type: 'all',
      period: route.query.period,
    },
  })
  if (data.value) {
    chartDataValue.value = data.value.data
    chartLabels.value = data.value.labels
    services.value = data.value.services
    pieGraphData.value = data.value.pieGraphData
  }

  setTimeout(() => {
    chartDataVisible.value = true
  }, 600)
}

async function getTop50() {
  inputLoading.value = true
  const { data, error }: any = await useFetch('/api/stats/top50', {
    method: 'GET',
    params: {
      searchValue: query.value,
    },
  })
  if (data.value) {
    top50Articles.value = data.value.top50Articles
    top50Buyouts.value = data.value.top50Buyouts
    top50pvz.value = data.value.top50pvz
    top50UsersByDeposit.value = data.value.top50UsersByDeposit
    if (topTitle.value != 'top50UsersByDeposit') {
      selectedTop.value = data.value.top50Buyouts
    } else {
      selectedTop.value = data.value.top50UsersByDeposit
    }
  }
  inputLoading.value = false
}

const withdrawsCount = ref(0)

await getTop50()
await getData()

const colorMode = useColorMode()
const chardColor = computed(() =>
  colorMode.value === 'light' ? '#570df8' : '#a469f7'
)

const barThickness = computed(() => {
  if (width.value > 768) {
    return 30
  } else {
    return 10
  }
})

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

const periods = [
  {
    title: 'Сегодня',
    value: 'today',
  },
  {
    title: 'Вчера',
    value: 'yesterday',
  },
  {
    title: '3 дня',
    value: 'threeDays',
  },
  {
    title: 'Неделя',
    value: 'week',
  },
  {
    title: 'Этот месяц',
    value: 'month',
  },
  {
    title: 'Прошлый месяц',
    value: 'lastMonth',
  },
  {
    title: 'Этот год',
    value: 'thisYear',
  },
  {
    title: 'Прошлый год',
    value: 'lastYear',
  },
]

function changeTop(event: any) {
  query.value = ''
  topTitle.value = event.target.value
  headers.forEach((el: any) => {
    if (el.value === event.target.value) {
      selectedHeaders.value = el
    }
  })

  if (event.target.value === 'top50Buyouts') {
    selectedTop.value = top50Buyouts.value
  }
  if (event.target.value === 'top50Articles') {
    selectedTop.value = top50Articles.value
  }
  if (event.target.value === 'top50pvz') {
    selectedTop.value = top50pvz.value
  }
  if (event.target.value === 'top50UsersByDeposit') {
    selectedTop.value = top50UsersByDeposit.value
  }
}

const headers = [
  {
    value: 'top50Buyouts',
    title: 'Топ 50 артикулов по выкупам',
    headers: ['Артикул', 'Количество'],
  },
  {
    value: 'top50Articles',
    title: 'Топ 50 артикулов по покупкам',
    headers: ['Артикул', 'Количество'],
  },
  {
    value: 'top50pvz',
    title: 'Топ 50 пунктов выдачи',
    headers: ['ПВЗ', 'Количество'],
  },
  {
    value: 'top50UsersByDeposit',
    title: 'Топ 50 пользователей по пополнениям',
    headers: ['ID', 'Никнейм', 'Email', 'Сумма пополнений'],
  },
]
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Аналитика</h1>
  <div class="card p-fluid"></div>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink :external="true" to="/stats">Аналитика</NuxtLink>
      </li>
    </ul>
  </div>
  <div class="flex justify-between mb-4 items-center mt-6">
    <div class="hidden lg:block"></div>
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
    <div class="w-11/12 max-h-96 flex flex-col">
      <div class="hidden lg:block mb-2 ml-6">
        <NuxtLink
          v-for="period in periods"
          :to="`/stats?type=${route.query.type}&period=${period.value}`"
          :external="true"
          :class="{
            'btn-active': route.query.period === period.value,
          }"
          class="btn btn-ghost btn-sm normal-case font-medium"
        >
          {{ period.title }}
        </NuxtLink>
      </div>
      <div class="flex w-full ml-2">
        <div
          class="card ml-3 w-44 mb-2 max-h-96 bg-base-100 shadow-xl"
          style="min-width: 100px"
        >
          <div class="card-body mt-4">
            <h2 class="text-left -ml-2 font-bold">
              {{ services[0].title }}
            </h2>
            <div class="flex flex-col text-left -mt-1 mb-3 justify-start">
              <!-- <h2 class="text-md font-bold h-3 mb-10">Количество:</h2> -->

              <p class="text text-primary font-bold">
                {{ services[0].quantity }}
                <span class="text-sm text-start"> шт. </span>
              </p>

              <p class="h-3 text-primary font-bold">
                {{ currency.format(services[0].expenses) }}
              </p>
            </div>
            <h2 class="text-left -ml-2 font-bold">
              {{ services[8].title }}
            </h2>
            <div class="flex flex-col text-left -mt-1 mb-3 justify-start">
              <!-- <h2 class="text-md font-bold h-3 mb-10">Количество:</h2> -->

              <p class="text text-primary font-bold">
                {{ services[8].quantity }}
                <span class="text-sm text-start"> шт. </span>
              </p>

              <p class="h-3 text-primary font-bold">
                {{ currency.format(services[8].expenses) }}
              </p>
            </div>
            <h2 class="text-left -ml-2 font-bold">
              {{ services[9].title }}
            </h2>
            <div class="flex flex-col text-left -mt-1 mb-3 justify-start">
              <!-- <h2 class="text-md font-bold h-3 mb-10">Количество:</h2> -->

              <p class="text text-primary font-bold">
                {{ services[9].quantity }}
                <span class="text-sm text-start"> шт. </span>
              </p>

              <p class="h-3 text-primary font-bold">
                {{ currency.format(services[9].expenses) }}
              </p>
            </div>
          </div>
        </div>
        <div class="w-6/12 ml-10 mt-7">
          <Bar
            id="chartId"
            :data="chartData"
            :options="chartOptions"
            ref="chartBar"
          />
        </div>
        <div
          v-if="chartDataVisible"
          class="w-4/12 mt-4 mr-10 font-mono text-md"
        >
          <PieGraph :info="pieGraphData"></PieGraph>
        </div>
      </div>
      <div class="flex flex-wrap mt-4">
        <div v-for="service in services">
          <div
            class="card md:w-40 bg-base-100 shadow-md ml-1 mb-1"
            style="min-width: 100px"
            v-if="service.value !== 'all'"
          >
            <div class="card-body">
              <h2 class="text-center font-bold h-12 text-sm">
                {{ service.title }}
              </h2>
              <div class="flex flex-col text-left justify-start mt-2">
                <!-- <h2 class="text-md font-bold h-3 mb-10">Количество:</h2> -->

                <p class="text text-primary font-bold">
                  {{ service.quantity }}
                  <span class="text-sm text-start"> шт. </span>
                </p>

                <p class="h-3 mt-2 text-primary font-bold">
                  {{ currency.format(service.expenses) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 flex justify-between">
        <div>
          <div class="flex my-5 gap-3">
            <div v-if="topTitle === 'top50UsersByDeposit'">
              <label
                ><input
                  v-model="query"
                  type="text"
                  placeholder="id, username, email, telegram"
                  class="input input-bordered input-sm ml-4 w-60"
                  @input="onInput($event)"
                />
              </label>
              <span
                v-if="inputLoading"
                class="loading loading-spinner text-primary loading-large ml-4"
              />
            </div>
            <select
              class="select select-sm select-bordered w-42 ml-4"
              @change="changeTop($event)"
              v-model="topTitle"
            >
              <option selected value="top50Buyouts">артикулы по выкупам</option>
              <option value="top50Articles">артикулы по кол-ву</option>
              <option value="top50pvz">пункты выдачи</option>
              <option value="top50UsersByDeposit">
                пользователи по пополнениям
              </option>
            </select>
            <p class="text-lg font-bold text-center">
              {{ selectedHeaders.title }}
            </p>
          </div>
          <div
            class="my-2 mx-2 overflow-y-auto ml-6 shadow-md"
            :style="{ 'max-height': height - 270 + 'px' }"
          >
            <table class="table">
              <!-- head -->
              <thead>
                <tr>
                  <th>№</th>
                  <th v-for="header in selectedHeaders.headers">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(element, index) in selectedTop" class="hover">
                  <td style="min-width: 50px">{{ index + 1 }}</td>
                  <td style="min-width: 150px; max-width: 150px">
                    {{ element._id }}
                  </td>
                  <td
                    style="min-width: 150px; max-width: 150px"
                    v-if="topTitle == 'top50UsersByDeposit'"
                  >
                    {{ element.username }}
                  </td>
                  <td
                    style="min-width: 250px; max-width: 250px"
                    v-if="topTitle == 'top50UsersByDeposit'"
                  >
                    {{ element.email }}
                  </td>
                  <td style="min-width: 100px">
                    {{
                      topTitle !== 'top50UsersByDeposit'
                        ? element.quantity
                        : currency.format(element.quantity)
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="h-10"></div>
        </div>
      </div>
    </div>
  </div>

  <div></div>
</template>

<style scoped></style>
