<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Добавить лайки',
})
const { notify } = useNotification()
const changedReviews = ref<any>([])

const route = useRoute()
const router = useRouter()
const reviews = ref<any>([])
const sortBy = ref('date')
const article = ref('')
const savedArticle = ref('')
const loading = ref(false)
async function getProductReviews() {
  loading.value = true
  changedReviews.value = []
  savedArticle.value = article.value
  const { data, error } = await useFetch('/api/likes/productReviews', {
    method: 'GET',
    headers: useRequestHeaders(['cookie']) as HeadersInit,
    query: {
      article: savedArticle.value,
      limit: 50,
      sortBy: route.query.sortBy || 'date',
    },
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
  if (!data.value.length) {
    notify({
      title: 'Отзывы не найдены',
    })
  }
  const initial = (data.value as any).map((review: any) => {
    review.addLikes = 0
    review.addDislikes = 0
    return review
  }) as any[]
  reviews.value = initial
  sortReviews()
}
function addLike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id)
      review.addLikes++
    return review
  })
  changedReviews.value.find((review: any) => review.id === id)
    ? changedReviews.value = changedReviews.value.map((review: any) => {
      if (review.id === id)
        review.likes++

      return review
    })
    : changedReviews.value.push({
      id,
      likes: 1,
      dislikes: 0,
    })
}
function removeLike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id)
      review.addLikes--
    return review
  })
  const review = changedReviews.value.find((review: any) => review.id === id)
  if (review) {
    if (review.likes > 1) {
      changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id)
          review.likes--

        return review
      })
    }
    else {
      if (review.likes === 1 && review.dislikes === 0) {
        changedReviews.value = changedReviews.value.filter((review: any) => review.id !== id)
      }
      else {
        changedReviews.value = changedReviews.value.map((review: any) => {
          if (review.id === id)
            review.likes--

          return review
        })
      }
    }
  }
}
function addDislike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id)
      review.addDislikes++
    return review
  })
  changedReviews.value.find((review: any) => review.id === id)
    ? changedReviews.value = changedReviews.value.map((review: any) => {
      if (review.id === id)
        review.dislikes++

      return review
    })
    : changedReviews.value.push({
      id,
      likes: 0,
      dislikes: 1,
    })
}
function removeDislike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id)
      review.addDislikes--
    return review
  })
  const review = changedReviews.value.find((review: any) => review.id === id)
  if (review) {
    if (review.dislikes > 1) {
      changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id)
          review.dislikes--
        return review
      })
    }
    else {
      if (review.likes === 0 && review.dislikes === 1) {
        changedReviews.value = changedReviews.value.filter((review: any) => review.id !== id)
      }
      else {
        changedReviews.value = changedReviews.value.map((review: any) => {
          if (review.id === id)
            review.dislikes--
          return review
        })
      }
    }
  }
}
function selectSorting(e: any) {
  sortBy.value = e.target.value
  router.push({
    query: {
      sortBy: e.target.value,
    },
  })
}
async function save() {
  const { data, error } = await useFetch('/api/likes/create', {
    method: 'POST',
    body: {
      article: savedArticle.value,
      reviews: changedReviews.value,
    },
  })
  if (error.value) {
    notify({
      type: 'error',
      title: 'Ошибка',
      text: error.value.message,
    })
    return
  }
  if (data.value) {
    notify({
      type: 'success',
      title: 'Успешно',
    })
    return router.push('/likes')
  }
}

async function cancel() {
  changedReviews.value = []
  article.value = savedArticle.value
  getProductReviews()
}
function getAddedLikes() {
  const addedLikes = changedReviews.value.reduce((acc: any, review: any) => {
    acc.likes += review.likes
    acc.dislikes += review.dislikes
    return acc
  }, {
    likes: 0,
    dislikes: 0,
  })
  return addedLikes
}
function sortReviews() {
  const val = sortBy.value
  if (val === 'date') {
    reviews.value = reviews.value.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  else if (val === 'rating') {
    reviews.value = reviews.value.sort((a: any, b: any) => {
      if (b.rating > a.rating)
        return 1
      else if (b.rating < a.rating)
        return -1
      else return 0
    })
  }
  else if (val === 'rank') {
    reviews.value = reviews.value.sort((a: any, b: any) => b.rank - a.rank)
  }
}
watch(route, (route) => {
  sortBy.value = route.query.sortBy as string
  sortReviews()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      Добавить лайки
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Укажите необходимое количество лайков/дизлайков к каждому отзыву.
    </p>

    <div class="relative flex justify-between mb-8 mt-6 items-center">
      <select class="select select-bordered select-sm" @change="selectSorting">
        <option value="date" :selected="route.query.sortBy === 'date'">
          По дате
        </option>
        <option value="rating" :selected="route.query.sortBy === 'rating'">
          По рейтингу
        </option>
        <option value="rank" :selected="route.query.sortBy === 'rank'">
          По полезности
        </option>
      </select>
      <div class="relative flex justify-end items-center flex-grow-0 w-60">
        <input
          v-model="article" type="number" placeholder="Артикул" class="input input-primary input-sm input-bordered w-full"
          @keydown.enter="getProductReviews"
        >
        <button class="btn btn-ghost btn-sm absolute normal-case" @click="getProductReviews">
          Найти
        </button>
      </div>
    </div>
    <div v-if="reviews.length" class="cards grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
      <LikesReviewCard
        v-for="(review, index) of reviews" :key="review.id" :index="index"
        :add-likes="review.addLikes"
        :add-dislikes="review.addDislikes"
        :info="review" @add-like="addLike" @remove-dislike="removeDislike" @add-dislike="addDislike"
        @remove-like="removeLike"
      />
      <div class="p-2 w-full col-span-1" />
    </div>
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-show="changedReviews.length"
          class="save fixed py-4 px-8 z-[9999] inset-x-0 bottom-0 bg-neutral-focus flex flex-wrap items-center justify-between gap-2"
        >
          <div class="info flex items-center gap-4">
            <p class="text-xs font-bold text-neutral-content lg:text-sm">
              Всего отзывов: {{ changedReviews.length }}
            </p>
            <p class="text-xs text-neutral-content lg:text-sm font-bold">
              Лайков: {{ getAddedLikes().likes }}
            </p>
            <p class="text-xs text-neutral-content lg:text-sm font-bold">
              Дизлайков: {{ getAddedLikes().dislikes
              }}
            </p>
          </div>
          <div class="save ml-auto flex gap-2">
            <button class="btn btn-ghost text-neutral-content btn-sm" @click="cancel">
              Отмена
            </button>
            <button class="btn btn-primary btn-sm" @click="save">
              Сохранить
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped></style>
