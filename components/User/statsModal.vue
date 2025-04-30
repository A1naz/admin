<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedUser: {
    type: Object,
    default: () => {
      uuid: ''
    },
  },
  status: {
    type: String,
    default: 'accepted',
  },
})

const emit = defineEmits(['update:isModalOpen'])
const loading = ref(false)
const dateRange = ref([])
const startDate = ref(new Date(Date.now() - 1000 * 60 * 60 * 24))

const statsForm = ref({
  turnOver: 0,
  profit: 0,
  buyoutsCount: 0,
  reviewsCount: 0,
})

async function getStats() {
  loading.value = true
  const { data }: any = await useFetch('/api/clientsInfo/getStats', {
    method: 'GET',
    params: {
      uuid: props.selectedUser.uuid,
      dateRange: dateRange.value,
    },
  })
  if (data.value) {
    console.log(data.value.profit)
    statsForm.value.profit = data.value.profit
    statsForm.value.turnOver = data.value.turnOver
    statsForm.value.buyoutsCount = data.value.buyoutsCount
    statsForm.value.reviewsCount = data.value.reviewsCount
    loading.value = false
  } else {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось получить статистику',
    })
  }
}

watch(
  () => props.selectedUser,
  () => {
    dateRange.value = []
    getStats()
  }
)

watch(
  () => dateRange.value,
  () => {
    getStats()
  }
)

const close = () => {
  emit('update:isModalOpen', false)
}

const currency = useCurrency()
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40 cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="close"
  >
    <div class="modal-box w-9/12 max-w-[500px] cursor-auto" @click.stop>
      <form method="dialog" class="flex justify-between">
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div v-if="!loading">
        <div class="w-10">
          <DateRangePicker
            v-model="dateRange"
            @reset="dateRange = []"
            :start-date="startDate"
          >
            <button class="btn btn-neutral">
              <Icon name="material-symbols:calendar-month-outline" size="26" />
            </button>
          </DateRangePicker>
        </div>

        <div class="mt-1 ml-2">
          Баланс
          <div
            type="text"
            class="input input-bordered w-full mt-1 pt-2"
            disabled
          >
            {{ currency.format(selectedUser.balance) }}
          </div>
        </div>
        <div class="mt-1 ml-2">
          Оборот
          <div
            type="text"
            class="input input-bordered w-full mt-1 pt-2"
            disabled
          >
            {{ currency.format(statsForm.turnOver) }}
          </div>
        </div>
        <div class="mt-1 ml-2">
          Прибыль
          <div
            type="text"
            class="input input-bordered w-full mt-1 pt-2"
            disabled
          >
            {{ currency.format(statsForm.profit) }}
          </div>
        </div>
        <div class="mt-1 ml-2">
          Выкупов
          <input
            type="text"
            class="input input-bordered w-full mt-1"
            disabled
            v-model="statsForm.buyoutsCount"
          />
        </div>
        <div class="mt-1 ml-2">
          Отзывов
          <input
            type="text"
            class="input input-bordered w-full mt-1"
            disabled
            v-model="statsForm.reviewsCount"
          />
        </div>
        <div class="mt-1 ml-2">
          Рефералов
          <input
            type="text"
            class="input input-bordered w-full mt-1"
            disabled
            v-model="selectedUser.referralsCount"
          />
        </div>
        <div class="mt-1 ml-2">
          Партнерка(баланс партнерки)
          <div
            type="text"
            class="input input-bordered w-full mt-1 pt-2"
            disabled
          >
            {{ currency.format(selectedUser.partnerBalance) }}
          </div>
        </div>
      </div>
      <div v-else class="w-full flex justify-center mt-2">
        <span class="loading loading-dots loading-lg text-primary"></span>
      </div>
    </div>
  </div>
</template>
