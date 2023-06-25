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
  <div
    class="card card-compact shadow-md transition duration-300 ease-in-out border-[2.5px] border-transparent hover:shadow-xl"
  >
    <figure class="rounded-lg">
      <a
        class="w-full h-72" :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`"
        target="_blank"
      >
        <nuxt-img fit="contain" class="w-full h-72 object-contain rounded-lg" :src="info.productimage" loading="lazy" /> </a>
    </figure>
    <div class="card-body overflow-hidden">
      <div class="truncate">
        <div class="card-title truncate mb-0 pb-0">
          <span class="truncate">{{ info.productname }}</span>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between gap-2 flex-wrap">
            <a
              :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
              class="text-sm text-secondary link link-hover"
            >
              {{ info.article }}
            </a>
            <label
              class="link link-hover text-sm text-gray-500 hover:text-primary truncate z-10"
              @click="openBuyout"
            >
              Выкуп

              #{{
                info.buyoutuuid }}</label>
          </div>
          <div class="flex gap-2">
            <div>Пол: {{ info.sex === 'female' ? 'Женский' : info.sex === 'male' ? 'Мужской' : 'Нет' }}</div>
            <div>Размер: {{ info.size === 'none' ? 'Нет' : info.size }}</div>
          </div>
        </div>
      </div>
      <div class="card-actions">
        <label
          for="review-modal" class="btn btn-primary btn-block"
          @click="$emit('openModal', info.buyoutuuid, info.id)"
        >Оставить
          отзыв</label>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
