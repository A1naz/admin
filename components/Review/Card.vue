<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },

})
const emit = defineEmits(['openModal'])
const router = useRouter()
function openBuyout() {
  router.push(`/buyouts?uuid=${props.info.buyoutuuid}`)
}
</script>

<template>
  <div class="rounded-lg bg-base-200">
    <div class="p-4 relative text-xl font-medium flex flex-col gap-2">
      <div class="flex gap-4">
        <a
          class="" :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`"
          target="_blank"
        >
          <div class="dropdown dropdown-hover">
            <label tabindex="0"> <nuxt-img
              width="36"
              class="rounded-lg" loading="lazy" fit="fill"
              :src="info?.productimage"
            />
            </label>
            <ul
              tabindex="0"
              class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-10"
            >
              <nuxt-img
                class="rounded-lg" loading="lazy" fit="fill"
                :src="info?.productimage"
              />
            </ul>
          </div>
        </a>
        <div class="w-full">
          <div class="flex justify-between flex-wrap">
            <span> {{ info.productname }}
            </span>
            <label
              class="text-[0.6rem] link link-hover sm:text-[0.8rem] lg:text-xs text-gray-500 hover:text-primary truncate z-10"
              @click="openBuyout"
            >#{{
              info.buyoutuuid }}</label>
          </div>
          <div class="flex justify-between flex-wrap gap-2 items-center">
            <div class="text-sm">
              <a
                :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                class="text-sm text-secondary link link-hover"
              >
                {{ info.article }}
              </a>
            </div>

            <div class="mt-2 lg:m-0 text-xs">
              Обновлено {{ $dayjs(info.updatedAt).format('D MMMM HH:mm') }}
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex gap-2 text-sm">
          <div>Пол: {{ info.sex.toLowerCase() === 'female' ? 'Женский' : info.sex.toLowerCase() === 'male' ? 'Мужской' : 'Нет' }}</div>
          <div>Размер: {{ info.size === 'none' ? 'Нет' : info.size }}</div>
        </div>
        <label
          for="review-modal" class="btn btn-sm btn-primary"
          @click="$emit('openModal', info.buyoutuuid, info.id)"
        >Оставить отзыв
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
