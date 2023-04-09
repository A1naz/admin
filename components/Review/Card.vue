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
</script>

<template>
  <div
    class="card card-compact shadow-md transition duration-300 ease-in-out border-[2.5px] border-transparent hover:shadow-xl"
  >
    <figure>
      <a
        class="w-full h-100" :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`"
        target="_blank"
      >
        <nuxt-img fit="fill" class="w-full h-100" :src="info.productimage" /> </a>
    </figure>
    <div class="card-body overflow-hidden">
      <div class="truncate">
        <div class="card-title truncate mb-0 pb-0">
          <span class="truncate">{{ info.productname }}</span>
        </div>
        <a
          :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
          class="text-sm text-secondary link link-hover"
        >
          {{ info.article }}
        </a>
      </div>
      <div class="card-actions">
        <label
          for="review-modal" class="btn btn-primary btn-block"
          @click="$emit('openModal', info.buyoutuuid)"
        >Оставить
          отзыв</label>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
