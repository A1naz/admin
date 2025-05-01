<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Статистика',
})

const currency = useCurrency()
const store = useMainStore()

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
      },
      {
        title: 'Самостоятельные',
        subtitle: 'Зарегистрировались без реф. ссылки',
        value: '30',
        key: 'selfRegistrations',
      },
      {
        title: 'Рефералка',
        subtitle: 'Зарегистрировались по реф. ссылке',
        value: '10',
        key: 'referralRegistrations',
      },
    ],
  },
  {
    title: 'Оборот - пополнения в суммах',
    content: [
      {
        title: 'Общее',
        value: '40 000 ₽',
        key: 'allTurnover',
      },
      {
        title: 'QR',
        value: '30 000 ₽',
        key: 'qrTurnover',
      },
      {
        title: 'Ручные',
        value: '10 000 ₽',
        key: 'manualTurnover',
      },
      {
        title: '% прибыли от оборота',
        value: '40 %',
        key: 'profit',
      },
      {
        title: 'Расход',
        value: '40 000 ₽',
        subtitle: 'Расход на покупку товаров',
        key: 'expense',
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
      },
      {
        title: 'Выкупы',
        value: '30 000 ₽',
        key: 'buyoutsProfit',
      },
      {
        title: 'Отзывы',
        value: '10 000 ₽',
        key: 'reviewsProfit',
      },
      {
        title: 'Штрафы',
        value: '10 000 ₽',
        key: 'penaltiesProfit',
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
      },
      {
        title: 'Выкупы',
        value: '300',
        key: 'buyoutsCount',
      },
      {
        title: 'Отзывы',
        value: '80',
        key: 'reviewsCount',
      },
      {
        title: 'Штрафы',
        value: '20',
        key: 'penaltiesCount',
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
      },
      {
        title: 'Партнерский баланс',
        value: '400 ',
        key: 'partnerBalance',
      },
      {
        title: 'Выплачено по партнерке',
        value: '300',
        key: 'paidByPartner',
      },
    ],
  },
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
const selectedPeriod = ref("month")
</script>

<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Статистика</h1>
  <div class="divider"></div>
  <div class="lg:block flex mb-2">
    <button
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
  <div class="p-1 rounded-xl shadow-md" v-for="category in categories">
    <h2 class="text-xl font-bold mb-4">{{ category.title }}</h2>
    <div class="flex flex-wrap gap-4 justify-between">
      <StatisticsStatCard
        v-for="item in category.content"
        :title="item.title"
        :value="item.value"
        :subtitle="item.subtitle"
      />
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
