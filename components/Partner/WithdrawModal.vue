<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close', 'publish'])

const currency = useCurrency()
const createWithdrawModal = ref(false)
const closeButton = ref<HTMLElement>()
const { data, error } = await useFetch('api/partner/withdraws')
const withdraws = ref(data.value as any[])
const { $dayjs } = useNuxtApp()

const now = useNow()
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
  emit('close')
})
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle">
  <div
    ref="closeButton" :class="{
      'modal-open': state,
    }"
    class="modal"
  >
    <div class="modal-box w-10/12 max-w-4xl">
      <label
        for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="$emit('close')"
      >✕</label>
      <div class="flex justify-between gap-2 items-center py-2">
        <h3 class="text-lg font-bold mb-2">
          Вывод средств
        </h3>
        <button class="btn btn-sm btn-primary" @click="createWithdrawModal = true">
          Создать вывод
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-sm">
          <!-- head -->
          <thead>
            <tr>
              <th>Дата</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th>Тип</th>
              <th>Детали</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
            <tr v-for="(item, index) in withdraws" :key="index">
              <td>{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
              <td>{{ item.status }}</td>
              <td>{{ currency.format(item.amount) }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <PartnerCreateWithdrawModal :state="createWithdrawModal" @close="createWithdrawModal = false" />
</template>

<style scoped>

</style>
