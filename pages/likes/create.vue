
<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification';
definePageMeta({
    layout: 'app',
    auth: true,
    title: 'Добавить лайки',
})
const { notify } = useNotification()

const route = useRoute()
const router = useRouter()
const selectSorting = (e: any) => {
    router.push({
        query: {
            sortBy: e.target.value
        }
    })
}
const reviews = ref([]) as any
const article = ref('')
const loading = ref(false)
const getProductReviews = async () => {
    loading.value = true
    const { data, error } = await useFetch('/api/likes/productReviews', {
        method: 'GET',
        headers: useRequestHeaders(['cookie']) as HeadersInit,
        query: {
            article: article.value,
            limit: 50,
            sortBy: route.query.sortBy || 'date',
        }
    })
    loading.value = false
    if (error.value) {
        notify({
            title: 'Что-то пошло не так',
            text: error.value.data.message,
            type: 'error',
        })
        return
    }

    console.log(data.value)
    reviews.value = data.value
}
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mt-1">Добавить лайки</h1>
        <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
            Укажите необходимое количество лайков/дизлайков к каждому отзыву.
        </p>

        <div class="relative flex justify-between mb-8 mt-6 items-center">
            <select @change="selectSorting" class="select select-bordered select-sm">
                <option value="date" :selected="route.query.sortBy === 'date'">По дате</option>
                <option value="rating" :selected="route.query.sortBy === 'rating'">По рейтингу</option>
                <option value="rank" :selected="route.query.sortBy === 'rank'">По полезности</option>
            </select>
            <div class="relative flex justify-end items-center flex-grow-0 w-50">
                <input @keydown.enter="getProductReviews" type="number" v-model="article" placeholder="Артикул"
                    class="input input-sm input-bordered w-full">
                <button @click="getProductReviews" class="btn btn-ghost btn-sm absolute normal-case">Найти</button>
            </div>

        </div>
        <div v-if="reviews.length">
            <transition-group class="cards grid grid-cols-1 lg:grid-cols-2 gap-4" tag="ul" name="fade">
                <LikesReviewCard :index="index" v-for="(review, index) of reviews" :key="review.id" :info="review">
                </LikesReviewCard>
            </transition-group>
            <div ref="target" class="p-2 w-full col-span-1"></div>

        </div>
    </div>
</template>


<style scoped></style>