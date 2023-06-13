<script setup lang="ts">
import { UseImage } from '@vueuse/components'

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  place: {
    type: Number,
    required: true,
  },

})
const emit = defineEmits(['callback', 'remove', 'openModal', 'openImage'])
const { $dayjs } = useNuxtApp()
onMounted(() => {
})
const getStatus = computed(() => {
  switch (props.info.status) {
    case 'created':
      return 'Создан'
    case 'waiting':
      return 'В очереди'
    case 'working':
      return 'В работе'
    case 'published':
      return 'Опубликован'
  }
})
</script>

<template>
  <div class="buyout-card card bg-base-200 shadow-lg">
    <div class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative">
      <div class="flex justify-between item mb-2 flex-wrap gap-4">
        <h2 class="card-title">
          Отзыв №{{ place }}
        </h2> <span
          :class="{

            'bg-green-600': info.status === 'working' || info.status === 'published',
            'bg-warning': info.status === 'waiting' || info.status === 'created',
          }" class="text-black p-2 px-8 rounded-lg text-center"
        >{{ getStatus }}</span>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col">
          <div class="relative w-full rounded-lg">
            <div class="truncate">
              {{ info.name }}
            </div>
            <a
              :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
              class="text-sm text-primary link link-hover"
            >
              {{ info.article }}
            </a>
          </div>
        </div>
        <div class="w-full">
          <div class="font-bold">
            Отзыв от товаре
          </div>
          <div
            class="w-full bg-base-200 h-16 overflow-y-auto scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin"
          >
            {{ info.text }}
          </div>
        </div>

        <div>
          <div class="font-bold">
            Рейтинг
          </div>
          <div class="relative w-full rounded-lg">
            <div class="rating">
              <input
                type="radio" disabled :checked="info.rating === 1" :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              >
              <input
                type="radio" disabled :checked="info.rating === 2" :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              >
              <input
                type="radio" disabled :checked="info.rating === 3" :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              >
              <input
                type="radio" disabled :checked="info.rating === 4" :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              >
              <input
                type="radio" disabled :checked="info.rating === 5" :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              >
            </div>
          </div>
        </div>

        <div>
          <div class="font-bold">
            Дата отзыва
          </div>
          <div class="relative w-full rounded-lg">
            <div>
              {{
                $dayjs(info.date).format('D MMMM HH:mm') }}
            </div>
          </div>
        </div>
        <div>
          <div class="font-bold pb-2">
            Фото
          </div>

          <div
            class="flex gap-2 items-center overflow-x-auto flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]"
          >
            <div v-for="(photo, i) of info.images" :key="i">
              <label v-if="photo" for="reviewImageModal">
                <div
                  class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-32 h-32 hover:bg-base-200 rounded-lg flex-none"
                  @click="() => emit('openImage', photo)"
                >
                  <div class="absolute inset-0">
                    <UseImage :src="photo">
                      <template #default>
                        <nuxt-img :src="photo" class="w-full h-full object-contain rounded-lg" />
                      </template>
                      <template #loading>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <Icon
                            name="mdi:loading"
                            class="loader ease-linear h-8 w-8 animate-spin"
                          />
                        </div>
                      </template>
                      <template #error>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-red-500 text-center">Ошибка загрузки</div>
                        </div>
                      </template>
                    </UseImage>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
