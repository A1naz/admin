<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отзывы',
})
const route = useRoute()
const end = ref(false)
const skip = ref(25)
const store = useMainStore()
const readyForReview = ref<any[] | null>([])
const reviews = ref<any[] | null>([])
const router = useRouter()
const autoTarget = ref(true)
const queryStatus = computed(() => route.query?.status ?? 'available')
const status = ref(route.query?.status ?? 'available')
const target = ref(null)
const targetIsVisible = ref(false)
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  },
)
async function getReviews(status: string, skip: number, limit: number) {
  if (status === 'available') {
    const { data } = await useFetch('/api/review/available', {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        limit,
        skip,
      },
    })
    return data.value as any[]
  }
  if (status === 'published') {
    const { data } = await useFetch('/api/review/published', {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        limit,
        skip,
        status: 'all',
      },
    })
    return data.value as any []
  }
  if (status === 'nofunds') {
    const { data } = await useFetch('/api/review/published', {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        limit,
        skip,
        status: 'nofunds',
      },
    })
    return data.value as any[]
  }
  return []
}
const openedPhoto = ref('')
reviews.value = await getReviews(status.value as string, 0, 25)

const selectedUUID = ref('')

async function findReviews(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    reviews.value = await getReviews(status.value as string, 0, 25)
    search.loading = false
    return
  }
  const { data, error } = await useFetch('/api/review/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value)
    reviews.value = data.value

  search.loading = false
}

const findReviewsDebounced = useDebounceFn(findReviews, 1000)

async function onSearchInput(event: Event) {
  autoTarget.value = false
  search.loading = true
  findReviewsDebounced(search.text, search.type)
}

function openInfoModal() {
  store.infoModal = true
  store.infoType = 'reviews'
}

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value) {
    if (end.value)
      return
    const data = await getReviews(status.value as string, skip.value, 25)
    if (data.length === 0) {
      end.value = true
      return
    }
    reviews.value = [...reviews.value as any[], ...data]
    skip.value += 25
  }
})

watch(() => queryStatus.value, async (newRoute, oldRoute) => {
  skip.value = 25
  end.value = false
  if (oldRoute === newRoute)
    return
  reviews.value = await getReviews(newRoute as string, 0, 25)
  status.value = queryStatus.value
}, { deep: true, immediate: false })

function openPhoto(src: string) {
  openedPhoto.value = src
}
const selectedDelivery = ref('')
const modalOpen = ref(false)

function openModal(uuid: string, deliveryid: string) {
  selectedUUID.value = uuid
  selectedDelivery.value = deliveryid
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
}
function goToPublished() {
  closeModal()
  router.push('/reviews?status=published')
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="flex items-center gap-2 mt-4">
        <h1 class="text-2xl font-bold ">
          Отзывы
        </h1>
        <InfoButton @click="openInfoModal" />
      </div>
      <p class="description">
        На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно от выкупа согласно вашему тарифу.
      </p>
      <p class="text-xs font-light mt-1 lg:text-sm">
        Стоимость одного отзыва -  <span class="font-bold">35 руб.</span>
      </p>
    </div>
    <div class="flex justify-between mb-2 mt-6 items-center">
      <div class="">
        <NuxtLink
          to="/reviews?status=available" :class="{
            'btn-active': route.query.status === 'available' || route.query.status === undefined,
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Доступные
        </NuxtLink>
        <NuxtLink
          to="/reviews?status=published" :class="{
            'btn-active': route.query.status === 'published',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Опубликованные
        </NuxtLink>
        <NuxtLink
          to="/reviews?status=nofunds" :class="{
            'btn-active': route.query.status === 'nofunds',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Недостаточно средств
        </NuxtLink>
      </div>
    </div>
    <div v-if="status === 'available'" class="search flex justify-between items-center mb-8 flex-wrap gap-2">
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
    <div v-if="reviews?.length">
      <div v-if="status === 'available'" class="cards grid grid-cols-1 gap-4">
        <ReviewCard
          v-for="(review, index) of reviews" :key="index" :index="index"
          :info="review" @open-modal="openModal"
        />
      </div>
      <div v-if="status === 'published' || status === 'nofunds'" class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
        <ReviewPublishedCard
          v-for="(review, index) of reviews" :key="index"
          :index="index" :info="review" @open-image="openPhoto"
        />
      </div>
      <div ref="target" class="flex justify-center items-center h-4" />
    </div>
    <Hero v-else />

    <ReviewModal
      v-if="modalOpen"
      :deliveryid="selectedDelivery"
      :state="modalOpen" :uuid="selectedUUID" @publish="goToPublished"
      @close="closeModal"
    />

    <!-- Put this part before </body> tag -->
    <input id="reviewImageModal" type="checkbox" class="modal-toggle">

    <label for="reviewImageModal" class="modal cursor-pointer">
      <label for="" class="modal-box min-w-0 max-w-5xl max-h-[80vh] p-0 overflow-hidden">
        <label for="reviewImageModal" class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2">✕</label>
        <nuxt-img v-if="openedPhoto" fit="contain" class="object-contain m-auto max-h-[80vh]" :src="openedPhoto || ''" loading="lazy" />
      </label>
    </label>
  </div>
</template>

<style scoped></style>
