<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Доставки',
})
const openAll = ref(false)
const route = useRoute()
const router = useRouter()
const deliveries = ref([]) as any
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
const { data, error } = await useFetch('/api/delivery/get', {
  method: 'GET',
  query: {
    status: route.query?.status || 'all',
    limit: 50,
  },
  headers: useRequestHeaders(['cookie']) as HeadersInit,
})

async function exportXLS() {
  const { data } = await useFetch('/api/delivery/export', {
    responseType: 'blob',
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'deliveries.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}

onMounted(async () => {
  deliveries.value = data.value
})

watch(targetIsVisible, async (isVisible) => {
  if (isVisible) {
    if (end.value)
      return
    const { data, error } = await useFetch('/api/delivery/get', {
      method: 'GET',
      query: {
        status: route.query?.status || 'all',
        limit: 50,
        skip: skip.value,
      },
      headers: useRequestHeaders(['cookie']) as HeadersInit,
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    deliveries.value = [...deliveries.value, ...data.value! as any]
    skip.value += 50
  }
})

watch(route, async (newRoute) => {
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/delivery/get', {
    method: 'GET',
    query: {
      status: newRoute?.query?.status || 'all',
      limit: 50,
    },
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  deliveries.value = data.value
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      Доставки
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      В этом разделе можно отследить статусы выкупов после оплаты. Статус "Доставлен" означает, что товар можно
      забирать из пункта выдачи.
    </p>

    <div class="flex justify-between mb-8 mt-6 items-center">
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
                <NuxtLink to="/delivery/export">
                  Готовы к выдаче
                </NuxtLink>
              </li>
              <li><a @click="exportXLS">Общая таблица</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-if="deliveries?.length">
      <TransitionSlide group tag="ul" class="flex flex-col gap-3">
        <li v-for="(delivery, index) of deliveries" :key="index" class="overflow-visible">
          <DeliveryExpand
            :state="openAll"
            :info="delivery" @open-modal="openModal"
          />
        </li>
        <div ref="target" class="flex justify-center items-center" />
      </TransitionSlide>
      <DeliveryQrModal v-if="modal" :code="modalInfo.code" :src="modalInfo.src" />
    </div>
    <div v-else class="hero">
      <div class="hero-content text-center flex justify-center items-center h-80">
        <div class="max-w-md">
          <h1 class="text-3xl font-bold">
            Здесь ничего нет <Icon name="fluent-emoji:thinking-face" />
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
