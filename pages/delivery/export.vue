<script setup lang="ts">
definePageMeta({
  auth: true,
  title: 'Экспорт',
  colorMode: 'light',
})

const pdfSection = ref<HTMLElement>()
const { $dayjs } = useNuxtApp()
const { $html2pdf } = useNuxtApp()
const openAll = ref(false)
const { width, height } = useWindowSize()
const progress = ref(0)
const max = ref(100)
const route = useRoute()
const currency = useCurrency()
const font = ref()
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
async function exportToFile() {
  progress.value = 0
  const options = {
    margin: 0,
    filename: 'Готовы к выдаче.pdf',
    html2canvas: {
      scale: 1.5,
      letterRendering: true,
      windowWidth: 1920,
      windowHeight: 1080,
    },
    jsPDF: {
      unit: 'px',
      hotfixes: ['px_scaling'],
      format: 'a4',
      orientation: 'l',
    },
  }
  const pages = Array.from(pdfSection.value!.querySelectorAll('div[aria-label^="pdf-page-"]'))
  max.value = pages.length - 1
  let worker = $html2pdf()
    .set(options)
    .from(pages[0])
  worker = worker.toPdf()
  if (pages.length > 1) {
    pages.slice(1).forEach((page, index) => {
      worker = worker.get('pdf').then((pdf: any) => {
        progress.value += 1
        pdf.addPage()
      }).from(page)
        .toContainer()
        .toCanvas()
        .toPdf()
    })
  }
  return worker.save()
}
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
const { data, error } = await useFetch('/api/delivery/getReady', {
  method: 'GET',
  headers: useRequestHeaders(['cookie']) as HeadersInit,
})

onMounted(async () => {
  deliveries.value = data.value
  const response = await $fetch('/Roboto-Regular.ttf', {
    responseType: 'arrayBuffer',
  }) as ArrayBuffer
  font.value = response
})
</script>

<template>
  <div class="overflow-auto">
    <progress class="progress progress-primary w-full fixed" :value="progress" :max="max" />
    <div class="flex">
      <button
        class="btn m-2 mt-4" @click="exportToFile"
      >
        Скачать PDF
      </button>
    </div>
    <div v-if="deliveries" ref="pdfSection" class="h-[90vh]">
      <h1 class="text-3xl font-bold text-center p-4 bg-purple-700 text-white">
        Готовы к выдаче
      </h1>
      <div v-for="(point, index) of Object.keys(deliveries)" :key="index" :aria-label="`pdf-page-${index + 1}`" class="point relative">
        <h1 class="text-center text-2xl font-bold absolute top-1 w-full">
          {{ point }}
        </h1>
        <div class="deliveryCards grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 px-2">
          <div v-for="(delivery, index) of deliveries[point]" :key="index" class="card h-[703px] rounded-none shadow-xl border border-primary mt-[65px] mb-[25px] mx-2">
            <figure><nuxt-img class="p-4 object-contain h-72" :src="delivery.receiptcodeqr" :alt="delivery.receiptcode" /></figure>
            <div class="card-body p-0">
              <h2 class="card-title text-center">
                {{ delivery.productname }}
              </h2>
              <div class="info grid grid-cols-2 gap-2 mt-4 justify-center text-center">
                <div>
                  {{ currency.format(delivery.pricebuy) }}
                </div>
                <div>
                  {{ $dayjs(delivery.updatedAt).format('D.MM.YYYY') }}
                </div>
                <div>Артикул</div>
                <div>{{ delivery.article }}</div>
                <div>Размер</div>
                <div>{{ delivery.size }}</div>
                <div>Получатель</div>
                <div>{{ delivery.recipient }}</div>
                <div>Телефон</div>
                <div>{{ delivery.recipientphone }}</div>
                <div class="font-bold">
                  Код получения
                </div>
                <div class="font-bold text-lg">
                  {{ delivery.receiptcode }}
                </div>
              </div>
              <div class="text-center my-4 text-sm">
                <div>ID выкупа</div>
                <a class="link" :href="`/buyouts?uuid=${delivery.uuid}`">#{{ delivery.uuid }}</a>
              </div>
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
