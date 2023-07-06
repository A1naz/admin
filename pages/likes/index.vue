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
const { width, height } = useWindowSize()
const { data, error } = await useFetch('/api/likes/get')
review_likes.value = data.value
function getStatus(status: string) {
  if (status === 'created')
    return 'Создан'
  else if (status === 'work')
    return 'В работе'
  else if (status === 'completed')
    return 'Завершен'
  else if (status === 'nofunds')
    return 'Недостаточно средств'
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
      <DataTable v-if="width > 1024" class="bg-base-200 hidden lg:block" :value="review_likes">
        <Column field="place" header="№" />
        <Column field="image" header="Фото">
          <template #body="{ data }">
            <nuxt-img width="32" class="rounded-lg object-contain" :src="data.image" loading="lazy" />
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
                'text-error': data.status === 'nofunds',
                'text-primary': data.status === 'created',
                'text-warning': data.status === 'work',
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
      <ul v-else class="w-full lg:hidden">
        <li v-for="(item, index) in review_likes" :key="index" class="pb-3 sm:pb-4">
          <div tabindex="0" class=" relative collapse collapse-arrow bg-base-200 rounded-box">
            <div class="collapse-title font-medium ">
              <div class="flex gap-6 items-center w-full">
                <div class="flex gap-4 items-start">
                  <div class="image">
                    <nuxt-img width="32" class="rounded-lg object-contain" :src="item.image" loading="lazy" />
                  </div>
                  <div class="article flex flex-col gap-0.5">
                    <div class="text-xs">
                      Артикул
                    </div>
                    <a
                      :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`" target="_blank"
                      class="text-secondary link link-hover text-sm"
                    >
                      {{ item.article }}
                    </a>
                  </div>
                  <div class="status flex flex-col gap-0.5">
                    <div class="text-xs">
                      Статус
                    </div>
                    <div
                      class="text-sm"
                      :class="{
                        'text-warning': item.status === 'created' || item.status === 'work',
                        'text-success': item.status === 'completed',
                      }"
                    >
                      <div>
                        {{ getStatus(item.status) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="absolute top-0 text-gray-400 right-3 date text-xs text-center mt-2 xs:bottom-0 xs:top-20">
                <div>
                  {{ $dayjs(item.createdDate).format('D MMMM HH:mm') }}
                </div>
              </div>
            </div>
            <div class="collapse-content flex gap-4">
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                  Лайков
                </dt>
                <dd class="font-semibold text-sm">
                  {{ item.likes }}
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                  Дизлайков
                </dt>
                <dd class="font-semibold text-sm">
                  {{ item.dislikes }}
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                  Дата завершения
                </dt>
                <dd class="font-semibold text-sm">
                  <div v-if="item.endedDate">
                    {{ $dayjs(item.endedDate).format('D MMMM HH:mm') }}
                  </div>
                  <div v-else>
                    Нет
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </li>
      </ul>
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
