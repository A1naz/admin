<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на отзывы',
})
const route = useRoute()
const router = useRouter()
const review_likes = ref([]) as any
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      Лайки на отзывы
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Лайки на отзывах, помогут вашим покупателям обратить внимание только на самые важные отзывы.
    </p>
    <div class="flex justify-end mb-8 mt-6 items-center">
      <NuxtLink to="/likes/create" class="btn btn-primary btn-sm gap-2 font-medium normal-case self-end">
        <Icon name="fluent:add-24-filled" size="24" />
        Добавить лайки
      </NuxtLink>
    </div>
    <div v-if="review_likes.length">
      <transition-group class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4" tag="ul" name="fade" />
      <div ref="target" class="p-2 w-full col-span-1" />
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

<style scoped></style>
