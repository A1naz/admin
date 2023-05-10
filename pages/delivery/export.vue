<script setup lang="ts">
definePageMeta({
  auth: true,
  title: 'Экспорт',
})

const pdfSection = ref<HTMLElement>()
const { $dayjs, $html2pdf } = useNuxtApp()
const openAll = ref(false)
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
function exportToFile() {
  $html2pdf(pdfSection.value, {
    margin: 0.2,
    filename: 'delivery.pdf',
    pagebreak: { after: '.deliveryCards' },
    image: {
      type: 'jpeg',
      quality: 2,
    },
    html2canvas: {
      scale: 2,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'in',
      format: 'a3',
      orientation: 'l',
    },
  })
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
        <button
          class="btn btn-sm" @click="exportToFile"
        >
          Export
        </button>
      </div>
      <div v-if="deliveries" ref="pdfSection">
        <h1 class="text-3xl font-bold text-center p-4 bg-purple-700 text-white">
          Готовы к выдаче
        </h1>
        <div v-for="(point, index) of Object.keys(deliveries)" :key="index" class="point">
          <h1 class="text-center bg-purple-600 p-4 text-white text-2xl font-bold">
            {{ point }}
          </h1>
          <div class="deliveryCards grid grid-cols-3 gap-4 p-4">
            <div v-for="(delivery, index) of deliveries[point]" :key="index" class="card rounded-none shadow-xl border border-primary">
              <figure><img class="p-4 object-contain h-58" :src="delivery.receiptcodeqr" :alt="delivery.receiptcode"></figure>
              <div class="card-body">
                <h2 class="card-title text-center">
                  {{ delivery.productname }}
                </h2>
                <div class="info grid grid-cols-2 gap-4 mt-4 justify-center text-center">
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
                  <div class="font-bold text-lg">
                    Код получения
                  </div>
                  <div class="font-bold text-lg">
                    {{ delivery.receiptcode }}
                  </div>
                </div>
                <div class="text-center mt-4 text-sm">
                  <div>ID выкупа</div>
                  <div>#{{ delivery.uuid }}</div>
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
