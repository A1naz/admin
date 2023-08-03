<script setup lang="ts">
import { usePrimeVue } from 'primevue/config'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'История платежей',
})
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  },
)
const skip = ref(50)
const end = ref(false)

const PrimeVue = usePrimeVue()
const { width, height } = useWindowSize()
const route = useRoute()
const currency = useCurrency()
const history = ref([]) as any
const { data, error } = await useFetch('/api/paymenthistory/get', {
  method: 'GET',
  query: {
    skip: 0,
    limit: 50,
  },

})
history.value = data.value
const exportDates = ref([])

async function exportToXLS() {
  const { data } = await useFetch('/api/paymenthistory/export', {
    method: 'POST',
    body: {
      exportDates: exportDates.value,
    },
    responseType: 'blob',
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Финансовый отчет услуг TOPVTOP.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}

watch(targetIsVisible, async (isVisible) => {
  if (isVisible) {
    if (end.value)
      return
    const { data, error } = await useFetch('/api/paymenthistory/get', {
      method: 'GET',
      query: {
        limit: 50,
        skip: skip.value,
      },
      headers: useRequestHeaders(['cookie']) as HeadersInit,
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    history.value = [...history.value, ...data.value! as any]
    skip.value += 50
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-4">
      История платежей
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm mb-6">
      Здесь можно увидеть движение вашего баланса
    </p>
    <div class="flex justify-between mb-8 mt-6 items-center">
      <div class="flex gap-4 items-center">
        <div v-if="history.length" class="export">
          <DateRangePicker v-model="exportDates" save-button="Экспорт в Excel" :start-date="new Date()" @select="exportToXLS">
            <button class="btn btn-sm btn-primary">
              Экспорт
            </button>
          </DateRangePicker>
        </div>
      </div>
    </div>
    <div v-if="width > 1024">
      <DataTable sort-field="dataoperation" :sort-order="-1" class="bg-base-200 hidden lg:block" :value="history" removable-sort>
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
      <div ref="target" class="flex justify-center items-center h-4" />
    </div>
    <ul v-else class="w-full lg:hidden">
      <li v-for="(item, index) in history" :key="index" class="pb-3 sm:pb-4">
        <div tabindex="0" class="collapse collapse-arrow bg-base-200 rounded-box">
          <div class="collapse-title font-medium ">
            <div class="mb-2 text-sm text-start">
              {{ item.basisoperation }}
            </div>
            <div class="flex gap-6 justify-between items-center">
              <div class="flex gap-2">
                <div class="sum">
                  {{ item.typeoperations === 'Приход' ? '+' : '-' }}
                  {{ currency.format(item.summ) }}
                </div>
              </div>
              <div class="date text-xs text-gray-500 dark:text-gray-400">
                {{ $dayjs(item.dataoperation).format('D MMMM HH:mm') }}
              </div>
            </div>
          </div>
          <div class="collapse-content">
            <div class="flex flex-col">
              <dt class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                Комментарий
              </dt>
              <dd class="font-semibold text-sm">
                {{ item.comment }}
              </dd>
            </div>
          </div>
        </div>
      </li>
      <div ref="target" class="flex justify-center items-center p-4 h-4" />
    </ul>
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
.p-column-header-content {
  @apply normal-case text-base
}
</style>
