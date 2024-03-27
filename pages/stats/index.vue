<script lang="ts" setup>
const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('аналитика')) {
  navigateTo('/partner')
}

const curPage = ref(1)
const dateSortIcon = ref('mdi-arrow-down')
const { width, height } = useWindowSize()
import { notify } from '@kyvg/vue3-notification'
import { Bar } from 'vue-chartjs'
const query = ref('')
const currency = useCurrency()
const chartDataVisible = ref(false)
const secondLevelReferrals = ref(0)
const route = useRoute()
const router = useRouter()
const isPageBtnsDisabled = ref(false)
const topTitle = ref('top50Buyouts')
const topForm: any = ref({
  top50Buyouts: [],
  top50Articles: [],
  top50pvz: [],
  top50UsersByDeposit: [],
  top100UsersByPartnerBalance: [],
  top100UsersByPartnerPayments: [],
  usersWithLastActivity: [],
})

// const top50Buyouts = ref<any>([])
// const top50Articles = ref<any>([])
// const top50pvz = ref<any>([])
// const top50UsersByDeposit = ref<any>([])
// const top100UsersByPartnerBalance = ref<any>([])
const inputLoading = ref(false)
const selectedHeaders = ref<any>({
  value: 'top50Buyouts',
  headers: ['Артикул', 'Количество'],
  title: 'Топ 50 артикулов по выкупам',
})
const selectedTop = computed(() => {
  return topForm.value[topTitle.value]
})
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
  if (topTitle.value === 'usersWithLastActivity') {
    await getUsersWithLastActivity()
  } else {
    // await getTop50()
  }
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

let chartDataValue = ref<any>([])
const services = ref<any>([
  {
    value: 'all',
    title: 'Всего',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'buyouts service',
    title: 'Выкупы',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'reviews',
    title: 'Отзывы',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'likes',
    title: 'Лайки',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'productlikes',
    title: 'Лайки на товар',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'questions',
    title: 'Вопросы',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'carts',
    title: 'Корзина',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'autoanswer',
    title: 'Автоответчик',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'partner full',
    title: 'Выплачено партнерам',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'partner active',
    title: 'Активные выплаты',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'penalty delivery',
    title: 'Штрафы за незабранные товары',
    expenses: 0,
    quantity: 0,
  },
  {
    value: 'partners ref balance summ',
    title: 'Партнерский баланс',
    expenses: 0,
    quantity: 0,
  },
])
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

// async function getTop50() {
//   inputLoading.value = true
//   const { data, error }: any = await useFetch('/api/stats/top50', {
//     method: 'GET',
//     params: {
//       searchValue: query.value,
//       selectedTop: selectedHeaders.value.value,
//     },
//   })
//   if (data.value) {
//     topForm.value.top50Articles = data.value.top50Articles
//     topForm.value.top50Buyouts = data.value.top50Buyouts
//     topForm.value.top50pvz = data.value.top50pvz
//     topForm.value.top50UsersByDeposit = data.value.top50UsersByDeposit
//     topForm.value.top100UsersByPartnerBalance =
//       data.value.top100UsersByPartnerBalance
//     topForm.value.top100UsersByPartnerPayments =
//       data.value.top100UsersByPartnerPayments
//   }
//   inputLoading.value = false
// }
async function getUsersWithLastActivity() {
  inputLoading.value = true
  const { data, error }: any = await useFetch(
    '/api/stats/usersWithLastActivity',
    {
      method: 'GET',
      params: {
        searchValue: query.value,
        sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
        pageNumber: curPage.value,
      },
    }
  )
  if (data.value) {
    topForm.value.usersWithLastActivity = data.value
  }
  inputLoading.value = false
}

const withdrawsCount = ref(0)

// await getTop50()
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
  topTitle.value = event.target.value

  headers.forEach((el: any) => {
    if (el.value === event.target.value) {
      selectedHeaders.value = el
    }
  })

  if (topTitle.value === 'usersWithLastActivity') {
    getUsersWithLastActivity()
  } else {
    // getTop50()
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
    headers: [
      'ID',
      'Никнейм',
      'Email',
      'Сумма пополнений',
      'Последняя активность',
    ],
  },
  {
    value: 'top100UsersByPartnerBalance',
    title: 'Топ 100 пользователей по балансу партнерки',
    headers: ['ID', 'Никнейм', 'Email', 'Баланс', 'Последняя активность'],
  },
  {
    value: 'top100UsersByPartnerPayments',
    title: 'Топ 100 пользователей по вознаграждениям партнерки',
    headers: [
      'ID',
      'Никнейм',
      'Email',
      'Сумма вознаграждений',
      'Последняя активность',
    ],
  },
  {
    value: 'usersWithLastActivity',
    title: 'Последняя активность пользователей',
    headers: ['ID', 'Никнейм', 'Email'],
  },
]

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getUsersWithLastActivity()
}

async function swapPage(destination: number) {
  if (destination < 0 && curPage.value <= 1) return
  curPage.value += destination
  isPageBtnsDisabled.value = true
  await getUsersWithLastActivity()
  isPageBtnsDisabled.value = false
}
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
        :key="service.value"
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
          :key="period.value"
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
        <div v-for="service in services" :key="service.value">
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
    </div>
  </div>
</template>

<style scoped></style>
