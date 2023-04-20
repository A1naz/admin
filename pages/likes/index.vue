<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на отзывы',
})
const { $dayjs } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const review_likes = ref([]) as any
const { data, error } = await useFetch('/api/likes/get')
review_likes.value = data.value
function getStatus(status: string) {
  if (status === 'created')
    return 'Создан'
  else if (status === 'work')
    return 'В работе'
  else if (status === 'completed')
    return 'Завершен'
}
onMounted(() => {
  review_likes.value = data.value
})
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
      <DataTable class="bg-base-200" :value="review_likes">
        <Column field="place" header="№" />
        <Column field="image" header="Фото">
          <template #body="{ data }">
            <nuxt-img width="32" class="rounded-lg object-contain" :src="data.image" />
          </template>
        </Column>
        <Column field="article" header="Артикул">
          <template #body="{ data }">
            <a
              :href="`https://www.wildberries.ru/catalog/${data.article}/detail.aspx`" target="_blank"
              class="text-secondary link link-hover"
            >
              {{ data.article }}
            </a>
          </template>
        </Column>
        <Column field="likes" header="Лайки" />
        <Column field="dislikes" header="Дизлайки" />
        <Column field="status" header="Статус">
          <template #body="{ data }">
            <div
              :class="{
                'text-warning': data.status === 'created' || data.status === 'work',
                'text-success': data.status === 'completed',
              }"
            >
              {{ getStatus(data.status) }}
            </div>
          </template>
        </Column>
        <Column field="createdDate" header="Дата создания">
          <template #body="{ data }">
            <div>
              {{ $dayjs(data.createdDate).format('D MMMM HH:mm') }}
            </div>
          </template>
        </Column>
        <Column field="endedDate" header="Дата завершения">
          <template #body="{ data }">
            <div v-if="data.endedDate">
              {{ $dayjs(data.endedDate).format('D MMMM HH:mm') }}
            </div>
            <div v-else>
              Нет
            </div>
          </template>
        </Column>
      </DataTable>
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
