<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отчеты по выкупам',
})
const openAll = ref(false)
const reports = ref([]) as any
const modalInfo = reactive({
  src: '',
  code: 0,
})
const autoTarget = ref(true)
const router = useRouter()
const route = useRoute()
const status = computed(() => route.query?.status || 'all')
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'uuid',
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
const skip = ref(20)
const end = ref(false)
async function getReports() {
  const { data, error } = await useFetch('/api/reports/get', {
    method: 'GET',
    query: {
      skip: 0,
      limit: 20,
      status: status.value,
    },
  })
  reports.value = data.value
}

await getReports()

async function findReports(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    await getReports()
    search.loading = false
    return
  }
  const { data, error } = await useFetch('/api/reports/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value)
    reports.value = data.value

  search.loading = false
}

const findReportsDebounced = useDebounceFn(findReports, 1000)
async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  autoTarget.value = false
  search.loading = true
  findReportsDebounced(search.text, search.type)
}
function selectStatus(e: Event) {
  const target = e.target as HTMLSelectElement
  router.push({
    path: '/reports',
    query: {
      status: target.value,
    },
  })
}

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value) {
    if (end.value)
      return
    const { data, error } = await useFetch('/api/reports/get', {
      method: 'GET',
      query: {
        limit: 20,
        skip: skip.value,
        status: status.value,
      },
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    reports.value = [...reports.value, ...data.value! as any]
    skip.value += 20
  }
})

watch(() => status.value, async (newRoute) => {
  skip.value = 20
  end.value = false
  const { data } = await useFetch('/api/reports/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      limit: 20,
    },
  })
  reports.value = data.value
}, { deep: true, immediate: true })
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-4">
      Отчеты по выкупам
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      В этом разделе можно посмотреть как производились выкупы
    </p>
    <div class="flex justify-between mb-8 mt-6 items-center">
      <select class="select select-bordered select-sm" @change="selectStatus">
        <option value="all" :selected="route.query.status === undefined">
          Все отчеты
        </option>
        <option value="today" :selected="route.query.status === 'today'">
          Сегодня
        </option>
        <option value="3days" :selected="route.query.status === '3days'">
          3 дня
        </option>
        <option value="7days" :selected="route.query.status === '7days'">
          7 дней
        </option>
      </select>
      <div class="flex gap-2 items-center flex-wrap">
        <div class="flex items-center">
          <input id="openAll" v-model="openAll" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
          <label for="openAll" class="cursor-pointer select-none ml-2">Развернуть все</label>
        </div>

        <div class="flex gap-1 items-center">
          <select v-model="search.type" disabled class="select select-bordered select-sm">
            <option value="uuid">
              ID
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
    </div>

    <div v-if="reports?.length">
      <TransitionSlide group class="grid grid-cols-1 gap-3">
        <ReportExpand v-for="(item, index) in reports" :key="index" :state="openAll" :info="item" />
        <div ref="target" class="flex justify-center items-center h-4" />
      </TransitionSlide>
    </div>
    <Hero v-else />
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>
