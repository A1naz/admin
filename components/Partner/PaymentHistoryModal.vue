<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close', 'publish'])

const currency = useCurrency()

const closeButton = ref<HTMLElement>()
const { data, error } = await useFetch('api/partner/paymenthistory')
const history = ref(data.value as any[])
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
          История баланса
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-sm">
          <!-- head -->
          <thead>
            <tr>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Тип</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
            <tr v-for="(item, index) in history" :key="index">
              <td>{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
              <td>{{ currency.format(item.amount) }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
