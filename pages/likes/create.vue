
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
    changedReviews.value = []
    reviews.value = []
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
const changedReviews = ref([]) as any
const addLike = (id: string) => {
    console.log(id)

    changedReviews.value.find((review: any) => review.id === id) ? changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id) {
            review.likes++
        }
        return review
    }) : changedReviews.value.push({
        id,
        likes: 1,
        dislikes: 0
    })
}
const removeLike = (id: string) => {
    console.log(id)

    const review = changedReviews.value.find((review: any) => review.id === id)
    if (review) {
        if (review.likes > 1) {
            changedReviews.value = changedReviews.value.map((review: any) => {
                if (review.id === id) {
                    review.likes--
                }
                return review
            })
        } else {
            if (review.likes === 1 && review.dislikes === 0) {
                changedReviews.value = changedReviews.value.filter((review: any) => review.id !== id)
            } else {
                changedReviews.value = changedReviews.value.map((review: any) => {
                    if (review.id === id) {
                        review.likes--
                    }
                    return review
                })
            }
        }
    }
}
const addDislike = (id: string) => {
    console.log(id)

    changedReviews.value.find((review: any) => review.id === id) ? changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id) {
            review.dislikes++
        }
        return review
    }) : changedReviews.value.push({
        id,
        likes: 0,
        dislikes: 1
    })
}
const removeDislike = (id: string) => {
    console.log(id)
    const review = changedReviews.value.find((review: any) => review.id === id)
    if (review) {
        if (review.dislikes > 1) {
            changedReviews.value = changedReviews.value.map((review: any) => {
                if (review.id === id) {
                    review.dislikes--
                }
                return review
            })
        } else {
            if (review.likes === 0 && review.dislikes === 1) {
                changedReviews.value = changedReviews.value.filter((review: any) => review.id !== id)
            } else {
                changedReviews.value = changedReviews.value.map((review: any) => {
                    if (review.id === id) {
                        review.dislikes--
                    }
                    return review
                })
            }
        }
    }
}
const getAddedLikes = () => {
    const addedLikes = changedReviews.value.reduce((acc: any, review: any) => {
        acc.likes += review.likes
        acc.dislikes += review.dislikes
        return acc
    }, {
        likes: 0,
        dislikes: 0
    })
    return addedLikes
}
watch(changedReviews, (val) => {
    console.log(val)
})
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
                <LikesReviewCard @add-like="addLike" @remove-dislike="removeDislike" @add-dislike="addDislike"
                    @remove-like="removeLike" :index="index" v-for="(review, index) of reviews" :key="review.id"
                    :info="review">
                </LikesReviewCard>
            </transition-group>
            <div ref="target" class="p-2 w-full col-span-1"></div>

        </div>
        <Teleport to="body">
            <Transition name="fade">
                <div v-show="changedReviews.length"
                    class="save fixed py-4 px-8 z-[9999] w-full bottom-0 bg-neutral flex flex-wrap items-center justify-between gap-2">
                    <div class="info flex items-center gap-4">
                        <p class="text-xs font-bold text-neutral-content lg:text-sm">
                            Всего отзывов: {{ changedReviews.length }}
                        </p>
                        <p class="text-xs text-neutral-content lg:text-sm font-bold">Лайков: {{ getAddedLikes().likes }}
                        </p>
                        <p class="text-xs text-neutral-content lg:text-sm font-bold">Дизлайков: {{ getAddedLikes().dislikes
                        }}</p>

                    </div>
                    <div class="save ml-auto">
                        <button @click="" class="btn btn-primary btn-sm ">Сохранить</button>
                    </div>
                </div>
            </Transition>
        </Teleport>

    </div>
</template>


<style scoped></style>