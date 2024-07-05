<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const { upload, getPublicUrl } = useS3Object()

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedTariff: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(['update:isModalOpen'])
const paymentsCount: any = ref({
  buyouts: 0,
  review: 0,
  likeReview: 0,
  likeProduct: 0,
  cart: 0,
  questionProduct: 0,
  deliveryStorage: 0,
  reviewRemoving: 0,
})
const loading = ref(false)

const close = () => {
  emit('update:isModalOpen', false)
}

async function getPaymentsCount() {
  for (const key in paymentsCount.value) {
    paymentsCount.value[key] = 0
  }
  loading.value = true
  const { data }: any = await useFetch('/api/tariffPlans/countPayments', {
    method: 'GET',
    query: {
      uuid: props.selectedTariff.uuid,
    },
    watch: false,
  })

  if (!data.value) {
    notify({
      title: 'Не удалось получить информацию о количестве услуг',
      type: 'error',
    })

    return
  }

  loading.value = false
  paymentsCount.value = data.value
}
watch(
  () => props.selectedTariff.uuid,
  () => {
    if (props.isModalOpen) {
      getPaymentsCount()
    }
  }
)

function getHistoryType(type: string) {
  let result = ''
  switch (type) {
    case 'buyouts':
      result = 'Выкупы'
      break
    case 'buyouts service':
      result = 'Оплата выкупа'
      break
    case 'review':
      result = 'Отзывы'
      break
    case 'likeReview':
      result = 'Лайки на отзыв'
      break
    case 'likeProduct':
      result = 'Лайки на товар / бренд'
      break
    case 'cart':
      result = 'Добавления в корзину'
      break
    case 'questionProduct':
      result = 'Вопросы'
      break
    case 'deliveryStorage':
      result = 'Штрафы'
      break
    case 'reviewRemoving':
      result = 'Удаления отзыва'
  }
  return result
}
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40 cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="close"
  >
    <div
      class="modal-box w-9/12 max-w-[500px] min-h-[500px] cursor-auto"
      @click.stop
    >
      <form method="dialog" class="flex justify-between">
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div v-if="loading" class="hero mt-20 text-lg text-primary">
        Идёт подсчёт услуг...
        <span class="loading loading-dots loading-lg"></span>
      </div>
      <div v-else>
        <div v-for="(value, name) in paymentsCount">
          <div class="ml-2 mt-0.5">{{ getHistoryType(name) }}</div>
          <input
            disabled
            type="text"
            class="input input-bordered w-full mt-0.5"
            v-model="paymentsCount[name]"
            :placeholder="getHistoryType(name)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
