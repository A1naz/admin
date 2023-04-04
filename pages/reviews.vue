<script setup lang="ts">
definePageMeta({
    layout: 'app',
    auth: true,
    title: 'Отзывы',
})
const route = useRoute()
const store = useMainStore();
const reviews = ref([]) as any
const router = useRouter()
const status = ref(route.query.status || 'available')
const openedPhoto = ref('')
if (status.value === 'available') {
    const { data } = await useFetch('/api/review/available', {
        method: 'GET',
        headers: useRequestHeaders(['cookie']) as HeadersInit,
        query: {
            limit: 50,
        }
    })
    reviews.value = data.value
}

if (status.value === 'published') {
    const { data } = await useFetch('/api/review/published', {
        method: 'GET',
        headers: useRequestHeaders(['cookie']) as HeadersInit,
        query: {
            limit: 50,
        }

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
            }
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
            }
        })
        reviews.value = data.value
        status.value = 'published'
        return
    }


})
const openPhoto = (src: string) => {
    openedPhoto.value = src
}
const modalOpen = ref(false)
const openModal = (uuid: string) => {
    selectedUUID.value = uuid
    modalOpen.value = true
}
const closeModal = () => {
    modalOpen.value = false
}

</script>
<template>
    <div>
        <div class="page-header">
            <h1 class="title">Отзывы</h1>
            <p class="description">
                На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно от выкупа согласно вашему тарифу.
            </p>
        </div>
        <div class="flex justify-between mb-8 mt-6 items-center">
            <div class="">
                <NuxtLink to="/reviews?status=available" :class="{
                    'btn-active': route.query.status === 'available' || route.query.status === undefined,
                }" class="btn btn-ghost btn-sm normal-case font-medium">
                    Доступные
                </NuxtLink>
                <NuxtLink to="/reviews?status=published" :class="{
                    'btn-active': route.query.status === 'published',
                }" class="btn btn-ghost btn-sm normal-case font-medium">
                    Опубликованные
                </NuxtLink>
            </div>
        </div>
        <div v-if="reviews.length" v-auto-animate class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            <ReviewCard v-if="status === 'available'" @open-modal="openModal" :index="index" :info="review"
                v-for="(review, index) of reviews" :key="index">
            </ReviewCard>
            <ReviewPublishedCard @open-image="openPhoto" :place="reviews.length - index" v-if="status === 'published'"
                :index="index" :info="review" v-for="(review, index) of reviews" :key="index"> </ReviewPublishedCard>
        </div>
        <div v-else class="hero">
            <div class="hero-content text-center flex justify-center items-center h-80">
                <div class="max-w-md">
                    <h1 class="text-3xl font-bold">Здесь ничего нет <Icon name="fluent-emoji:thinking-face"></Icon>
                    </h1>
                </div>
            </div>
        </div>
        <ReviewModal @publish="router.push('/reviews?status=published')" @close="closeModal" :state="modalOpen"
            :uuid="selectedUUID" />

        <!-- Put this part before </body> tag -->
        <Teleport to="body">
            <input type="checkbox" id="reviewImageModal" class="modal-toggle" />

            <label for="reviewImageModal" class="modal cursor-pointer">
                <label for="" class="modal-box w-11/12 max-w-5xl p-0">
                    <label for="reviewImageModal" class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2">✕</label>
                    <nuxt-img fit="contain" class="object-contain" v-if="openedPhoto" :src="openedPhoto" />
                </label>
            </label>
        </Teleport>
    </div>
</template>



<style scoped></style>