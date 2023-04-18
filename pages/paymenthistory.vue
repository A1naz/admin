<script setup lang="ts">
import { usePrimeVue } from 'primevue/config'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'История платежей',
})

const PrimeVue = usePrimeVue()

const route = useRoute()
const currency = useCurrency()
const history = ref([]) as any
const { data, error } = await useFetch('/api/paymenthistory/get', {
  method: 'GET',
})
history.value = data.value
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      История платежей
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Здесь можно увидеть движение вашего баланса
    </p>
    <div class="flex justify-end mb-8 mt-6 items-center" />
    <DataTable sort-field="dataoperation" :sort-order="-1" class="bg-base-200" :value="history" removable-sort>
      <Column field="summ" sortable header="Сумма">
        <template #body="{ data }">
          {{ currency.format(data.summ) }}
        </template>
      </Column>
      <Column field="typeoperations" sortable header="Тип операции" />
      <Column field="basisoperation" sortable header="Основание операции" />
      <Column field="dataoperation" sortable header="Дата">
        <template #body="{ data }">
          <div class="">
            {{ $dayjs(data.dataoperation).format('D MMMM HH:mm') }}
          </div>
        </template>
      </Column>
      <Column field="comment" sortable header="Комментарий" />
    </DataTable>
  </div>
</template>

<style>
.p-datatable-wrapper {
 @apply bg-base-200 rounded-lg
}
.p-datatable {
  @apply bg-base-200 rounded-lg
}
.p-datatable-table {
  @apply table table-zebra rounded-lg
}
.p-column-header-content {
  @apply flex gap-2
}
.p-sortable-column {

}
</style>
