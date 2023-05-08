<script setup lang="ts">
import { exportToPDF } from '#imports'

definePageMeta({
  auth: true,
  title: 'Экспорт',
})
const pdfSection = ref<HTMLElement | undefined>(undefined)

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
  const { data } = await useFetch('/api/delivery/getReady', {
    method: 'GET',
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  deliveries.value = data.value
})
</script>

<template>
  <div>
    <ClientOnly>
      <div class="flex">
        <button class="btn btn-sm" @click="exportToPDF('my-pdf-file.pdf', pdfSection)">
          Export
        </button>
      </div>
      <div v-if="deliveries?.length" ref="pdfSection">
        <h1 class="text-3xl font-bold text-center p-2 bg-purple-700 text-white">
          Готовы к выдаче
        </h1>
        <div class="cards grid grid-cols-4 gap-4 p-4">
          <div v-for="(delivery, index) of deliveries" :key="index" class="card rounded-none shadow-xl">
            <figure><img class="p-8" :src="delivery.receiptcodeqr" :alt="delivery.receiptcode"></figure>
            <div class="card-body">
              <h2 class="card-title text-center">
                {{ delivery.productname }}
              </h2>
              <p>If a dog chews shoes whose shoes does he choose?</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
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
    </ClientOnly>
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
