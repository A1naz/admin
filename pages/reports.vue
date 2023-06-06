<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отчеты по выкупам',
})
const openAll = ref(false)
const route = useRoute()
const router = useRouter()
const reports = ref([]) as any
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
const { data, error } = await useFetch('/api/reports/get', {
  method: 'GET',
  query: {
  },
  headers: useRequestHeaders(['cookie']) as HeadersInit,
})

onMounted(async () => {
  reports.value = data.value
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      Отчеты по выкупам
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      В этом разделе можно посмотреть как производились выкупы
    </p>
    <div class="flex justify-between mb-8 mt-6 items-center">
      <div class="flex gap-4 items-center">
        <div class="flex items-center">
          <input id="openAll" v-model="openAll" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
          <label for="openAll" class="cursor-pointer select-none ml-2">Развернуть все</label>
        </div>
      </div>
    </div>

    <div v-if="reports?.length">
      <TransitionSlide group class="grid grid-cols-1 gap-3">
        <ReportExpand v-for="(item, index) in reports" :key="index" :state="openAll" :info="item" />
      </TransitionSlide>
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
