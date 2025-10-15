<script setup lang="ts">
import { NuxtLoadingIndicator } from '#build/components'
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Статистика',
})

const currency = useCurrency()
const store = useMainStore()
const selectedMp = ref('all')
const mps = ref([
  {
    title: 'Все',
    value: 'all',
  },
  {
    title: 'Wildberries',
    value: 'wildberries',
  },
  {
    title: 'Ozon',
    value: 'ozon',
  },
  {
    title: 'Yandex Market',
    value: 'ym',
  },
  {
    title: 'Flowwow',
    value: 'flowwow',
  },
  
  {
    title: 'Sutochno',
    value: 'sutochno',
  },
  {
    title: 'Ozon Hotels',
    value: 'ozonhotels',
  },
])

if (!store.client.mainAdmin && !store.client.tabs.includes('статистика')) {
  navigateTo('/waitingRoom')
}

const categories = ref<
  {
    title: string
    content: {
      title: string
      subtitle?: string
      value: string
      key?: string
      type?: string
    }[]
  }[]
>([
  {
    title: 'Лидов',
    content: [
      {
        title: 'Регистраций',
        subtitle: 'Всего зарегистрировалось',
        value: '40',
        key: 'allRegistrations',
        type: 'number',
      },
      {
        title: 'Самостоятельные',
        subtitle: 'Зарегистрировались без реф. ссылки',
        value: '30',
        key: 'selfRegistrations',
        type: 'number',
      },
      {
        title: 'Рефералка',
        subtitle: 'Зарегистрировались по реф. ссылке',
        value: '10',
        key: 'referralRegistrations',
        type: 'number',
      },
    ],
  },
  {
    title: 'Оборот - пополнения в суммах',
    content: [
      {
        title: 'Общее',
        value: '0',
        key: 'allTurnover',
        type: 'money',
      },
      {
        title: 'НДС 5%',
        value: '1',
        subtitle: 'НДС на пополнения',
        key: 'nds',
        type: 'money',
      },
      {
        title: 'QR',
        value: '30 000 ₽',
        key: 'qrTurnover',
        type: 'money',
      },
      {
        title: 'Ручные',
        value: '10 000 ₽',
        key: 'manualTurnover',
        type: 'money',
      },
      {
        title: '% прибыли от оборота',
        value: '40 %',
        key: 'profit',
        type: 'percent',
      },
      {
        title: 'Расход',
        value: '40 000 ₽',
        subtitle: 'Расход на покупку товаров',
        key: 'expenses',
        type: 'money',
      },
    ],
  },
  {
    title: 'Прибыль с услуг',
    content: [
      {
        title: 'Общее',
        value: '40 000 ₽',
        key: 'allProfitFromServices',
        type: 'money',
      },
      {
        title: 'Выкупы',
        value: '30 000 ₽',
        key: 'buyoutsProfit',
        type: 'money',
      },
      {
        title: 'Отзывы',
        value: '10 000 ₽',
        key: 'reviewsProfit',
        type: 'money',
      },
      {
        title: 'Штрафы',
        value: '10 000 ₽',
        key: 'penaltiesProfit',
        type: 'money',
      },
    ],
  },
  {
    title: 'Услуг - количество оказанных услуг',
    content: [
      {
        title: 'Всего',
        value: '400 ',
        key: 'allServicesCount',
        type: 'number',
      },
      {
        title: 'Выкупы',
        value: '300',
        key: 'buyoutsCount',
        type: 'number',
      },
      {
        title: 'Отзывы',
        value: '80',
        key: 'reviewsCount',
        type: 'number',
      },
      {
        title: 'Штрафы',
        value: '20',
        key: 'penaltiesCount',
        type: 'number',
      },
    ],
  },
  {
    title: 'Баланс',
    content: [
      {
        title: 'Общий баланс',
        value: '400 ',
        key: 'balance',
        type: 'money',
      },
      {
        title: 'Партнерский баланс',
        value: '400 ',
        key: 'partnerBalance',
        type: 'money',
      },
      {
        title: 'Выплачено по партнерке',
        value: '300',
        key: 'paidByPartner',
        type: 'money',
      },
    ],
  },
  {
    title: 'AI - отзывы',
    content: [
      {
        title: 'AI тексты',
        value: '0 ₽',
        key: 'aiTextsProfit',
        type: 'money',
      },
      {
        title: 'AI фото',
        value: '0 ₽',
        key: 'aiPhotosProfit',
        type: 'money',
      },
      {
        title: 'AI видео',
        value: '0',
        key: 'aiVideosProfit',
        type: 'money',
      },
      {
        title: 'AI аудио',
        value: '0',
        key: 'aiAudioProfit',
        type: 'money',
      },
    ],
  },
  // {
  //   title: 'AI - Аналитика',
  //   content: [
  //     {
  //       title: 'Отзывы+Вопросы',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Цены',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Акции',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Поставки',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Негатив',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //   ],
  // },
  // {
  //   title: 'AI - Карточка товара',
  //   content: [
  //     {
  //       title: 'Инфографика',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'SEO',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Видео',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Фото+Видео',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Под ключ',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'A/B тесты',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //   ],
  // },
  // {
  //   title: 'AI - Стратегия',
  //   content: [
  //     {
  //       title: 'Самовыкупы',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Реклама',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Блогеры',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     }
  //   ],
  // },
  // {
  //   title: 'AI - Стратегия',
  //   content: [
  //     {
  //       title: 'Флаер',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Рич контент',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     },
  //     {
  //       title: 'Упаковка',
  //       value: '0 ₽',
  //       key: 'aiVideosProfit',
  //       type: 'money',
  //     }
  //   ],
  // },
])

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
const selectedPeriod = ref('month')

const stats: any = ref({
  allRegistrations: 0,
  selfRegistrations: 0,
  referralRegistrations: 0,
  allTurnover: 0,
  qrTurnover: 0,
  manualTurnover: 0,
  profit: 0,
  expenses: 0,
  allProfitFromServices: 0,
  buyoutsProfit: 0,
  reviewsProfit: 0,
  penaltiesProfit: 0,
  allServicesCount: 0,
  buyoutsCount: 0,
  reviewsCount: 0,
  penaltiesCount: 0,
  balance: 0,
  partnerBalance: 0,
  paidByPartner: 0,
})

const { data: ndsData, status: ndsStatus } = useLazyFetch('/api/statistics/nds', {
  method: 'GET',
})

const { data, status }: any = useLazyFetch('/api/statistics/generalInfo', {
  method: 'GET',
  query: {
    date: selectedPeriod,
    mp: selectedMp,
  },
})

watch(data, () => {
  if (data.value) {
    stats.value = data.value
  }
})

const getValue = (item: any) => {
  if (!data.value) return ''
  if (item.type === 'number') {
    return data.value[item.key]
  }
  if (item.type === 'money') {
    return currency.format(data.value[item.key])
  }
  return data.value[item.key]
}
</script>

<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Статистика</h1>
  <div class="divider"></div>
  <select
    v-model="selectedMp"
    class="select select-bordered max-w-xs ml-2 mb-2"
  >
    <option v-for="mp in mps" :key="mp.value" :value="mp.value">
      {{ mp.title }}
    </option>
  </select>
  <div class="lg:block flex mb-2">
    <button
      :disabled="status === 'pending'"
      @click="selectedPeriod = period.value"
      :key="period.value"
      v-for="period in periods"
      :external="true"
      class="btn btn-ghost btn-sm normal-case font-medium"
      :class="{
        'btn-active': selectedPeriod === period.value,
      }"
    >
      {{ period.title }}
    </button>
  </div>
  <div
    class="p-1 rounded-xl shadow-md"
    v-for="category in categories"
    v-if="status === 'success' && data"
  >
    <h2 class="text-xl font-bold mb-4">{{ category.title }}</h2>
    <div class="flex flex-wrap gap-4 justify-between">
      <StatisticsStatCard
        v-for="item in category.content"
        :title="item.title"
        :value="getValue(item)"
        :subtitle="item.subtitle"
      />
    </div>
  </div>
  <div v-else-if="status === 'pending'" class="w-full pt-20 text-center">
    <span class="loading loading-dots loading-lg"></span>
  </div>
  <div v-else class="w-full pt-20 text-center">
    <span class="loading loading-dots loading-lg">Ошибка</span>
  </div>
  <div class="divider"></div>
  
  <div v-if="ndsStatus === 'success' && ndsData && ndsData.length" class="p-1 rounded-xl shadow-md">
    <h2 class="text-xl font-bold mb-4">НДС</h2>
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Месяц</th>
            <th>QR-код</th>
            <th>Счета</th>
            <th>Общий НДС</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ndsData" :key="item.month">
            <td>{{ item.month }}</td>
            <td>{{ currency.format(item.qrNds) }}</td>
            <td>{{ currency.format(item.manualNds) }}</td>
            <td>{{ currency.format(item.totalNds) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="divider h-10 mb-10"></div>
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
