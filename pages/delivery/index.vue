<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Доставки',
})
const openAll = ref(false)
const route = useRoute()
const router = useRouter()
const deliveries = ref([]) as any
const autoTarget = ref(true)
const status = computed(() => route.query?.status || 'all')
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
function selectStatus(e: Event) {
  const target = e.target as HTMLSelectElement
  router.push({
    path: '/delivery',
    query: {
      status: target.value,
    },
  })
}
const modalInfo = reactive({
  src: '',
  code: 0,
})
const modal = ref(false)
function openModal(code: number, src: string) {
  modalInfo.src = src
  modalInfo.code = code
  modal.value = true
}
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
async function getDeliveries() {
  const { data, error } = await useFetch('/api/delivery/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      limit: 50,
    },
  })
  deliveries.value = data.value
}
await getDeliveries()

async function exportReadyXLS() {
  const { data } = await useFetch('/api/delivery/exportReady', {
    responseType: 'blob',
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Готовы к выдаче.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}
async function exportXLS() {
  const { data, error } = await useFetch('/api/delivery/export', {
    responseType: 'blob',
  })
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось экспортировать данные',
    })
    return
  }
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Общая таблица.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}

async function findDeliveries(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    await getDeliveries()
    search.loading = false
    return
  }
  const { data, error } = await useFetch('/api/delivery/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value)
    deliveries.value = data.value

  search.loading = false
}

const findDeliveriesDebounced = useDebounceFn(findDeliveries, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  autoTarget.value = false
  search.loading = true
  findDeliveriesDebounced(search.text, search.type)
}

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value) {
    if (end.value)
      return
    const { data, error } = await useFetch('/api/delivery/get', {
      method: 'GET',
      query: {
        status: route.query?.status || 'all',
        limit: 50,
        skip: skip.value,
      },
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    deliveries.value = [...deliveries.value, ...data.value! as any]
    skip.value += 50
  }
})

watch(() => status.value, async (newRoute) => {
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/delivery/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      limit: 50,
    },
  })
  deliveries.value = data.value
}, { deep: true, immediate: true })
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-4">
      Доставки <div class="tooltip tooltip-bottom" data-tip="Видео-инструкция по заборам">
        <a class="hover:text-primary" target="_blank" href="https://youtu.be/URh2G7fzl-g">
          <IconCSS size="24" class="h-8 w-8" name="uil:youtube" />
        </a>
      </div>
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      В этом разделе можно отследить статусы выкупов после оплаты. Статус "Доставлен" означает, что товар можно
      забирать из пункта выдачи.
    </p>

    <div class="flex justify-between mb-2 mt-6 items-center flex-wrap gap-4">
      <select class="select select-bordered select-sm" @change="selectStatus">
        <option value="all" :selected="route.query.status === undefined">
          Все доставки
        </option>
        <option value="active" :selected="route.query.status === 'active'">
          Активные
        </option>
        <option value="completed" :selected="route.query.status === 'completed'">
          Завершенные
        </option>
      </select>
      <div class="flex gap-4 items-center">
        <div class="flex items-center">
          <input id="openAll" v-model="openAll" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
          <label for="openAll" class="cursor-pointer select-none ml-2">Развернуть все</label>
        </div>
        <div v-if="deliveries.length" class="export">
          <div class="dropdown dropdown-end z-10">
            <label tabindex="0" class="btn btn-sm btn-primary m-1">Экспорт</label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <NuxtLink target="blank" to="/delivery/export">
                  Готовы к выдаче PDF
                </NuxtLink>
              </li>
              <li><a @click="exportReadyXLS">Готовы к выдаче Excel</a></li>

              <li><a @click="exportXLS">Общая таблица Excel</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="search flex justify-between items-center mb-8 flex-wrap gap-2">
      <div />
      <div class="flex gap-1 items-center">
        <select v-model="search.type" class="select select-bordered select-sm">
          <option value="article">
            Артикул
          </option>
          <option value="uuid">
            ID выкупа
          </option>
        </select>
        <div class="relative flex items-center flex-grow-0 w-full">
          <input v-model="search.text" type="text" class="input input-sm input-bordered" placeholder="Поиск" @input="onSearchInput($event)">

          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2"
          />
        </div>
      </div>
    </div>
    <div v-if="deliveries?.length">
      <TransitionSlide group tag="ul" class="flex flex-col gap-3">
        <li v-for="(delivery, index) of deliveries" :key="index" class="overflow-visible z-0">
          <DeliveryExpand
            :state="openAll"
            :info="delivery" @open-modal="openModal"
          />
        </li>
        <div ref="target" class="flex justify-center items-center h-4" />
      </TransitionSlide>
      <DeliveryQrModal v-if="modal" :code="modalInfo.code" :src="modalInfo.src" />
    </div>
    <Hero v-else />
  </div>
</template>

<style scoped>

</style>
