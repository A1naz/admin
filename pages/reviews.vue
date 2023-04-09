<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отзывы',
})
const route = useRoute()
const store = useMainStore()
const reviews = ref([]) as any
const router = useRouter()
const status = ref(route.query?.status || 'available')
const openedPhoto = ref('')
if (status.value === 'available') {
  const { data } = await useFetch('/api/review/available', {
    method: 'GET',
    headers: useRequestHeaders(['cookie']) as HeadersInit,
    query: {
      limit: 50,
    },
  })
  reviews.value = data.value
}

if (status.value === 'published') {
  const { data } = await useFetch('/api/review/published', {
    method: 'GET',
    headers: useRequestHeaders(['cookie']) as HeadersInit,
    query: {
      limit: 50,
    },

  })
  reviews.value = data.value
}

onMounted(async () => {
})
const selectedUUID = ref('')
const headers = useRequestHeaders(['cookie']) as HeadersInit

watch(route, async (newRoute) => {
  console.log(newRoute.query.status)
  if (newRoute.query.status === 'available' || !newRoute.query.status) {
    const { data } = await useFetch('/api/review/available', {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        limit: 50,
      },
    })
    reviews.value = data.value
    status.value = 'available'
    return
  }
  if (newRoute.query.status === 'published') {
    const { data } = await useFetch('/api/review/published', {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        limit: 50,
      },
    })
    reviews.value = data.value
    status.value = 'published'
  }
})
function openPhoto(src: string) {
  openedPhoto.value = src
}
const modalOpen = ref(false)
function openModal(uuid: string) {
  selectedUUID.value = uuid
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="title">
        Отзывы
      </h1>
      <p class="description">
        На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно от выкупа согласно вашему тарифу.
      </p>
    </div>
    <div class="flex justify-between mb-8 mt-6 items-center">
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
      </div>
    </div>
    <div v-if="reviews.length" v-auto-animate class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      <ReviewCard
        v-for="(review, index) of reviews" v-if="status === 'available'" :key="index" :index="index"
        :info="review" @open-modal="openModal"
      />
      <ReviewPublishedCard
        v-for="(review, index) of reviews" v-if="status === 'published'" :key="index"
        :place="reviews.length - index" :index="index" :info="review" @open-image="openPhoto"
      />
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
    <ReviewModal
      :state="modalOpen" :uuid="selectedUUID" @publish="router.push('/reviews?status=published')"
      @close="closeModal"
    />

    <!-- Put this part before </body> tag -->
    <Teleport to="body">
      <input id="reviewImageModal" type="checkbox" class="modal-toggle">

      <label for="reviewImageModal" class="modal cursor-pointer">
        <label for="" class="modal-box min-w-0 max-w-5xl p-0">
          <label for="reviewImageModal" class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2">✕</label>
          <nuxt-img v-if="openedPhoto" fit="contain" class="object-contain m-auto" :src="openedPhoto" />
        </label>
      </label>
    </Teleport>
  </div>
</template>

<style scoped></style>
