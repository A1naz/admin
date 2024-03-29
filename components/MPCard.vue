<script setup lang="ts">
const store = useMainStore()
const props = defineProps({
  info: {
    type: Object,
  },
  page: {
    type: String,
    default: '/buyouts/create',
  },
  query: {
    type: Object,
    default: {},
  },
})
const theme = useColorMode()
</script>

<template>
  <div class="card xl:w-[265px] bg-base-100 shadow-xl">
    <figure>
      <nuxt-img
        class="px-4 pt-4"
        :src="`/img/mp/${info?.value}.png`"
        alt="Shoes"
      />
    </figure>
    <div class="card-body -my-6 pl-4">
      <h2 class="card-title text-primary">{{ info?.title }}</h2>
      <div class="flex justify-start">
        <span style="opacity: 0.8">Категория:</span>
        <span class="ml-2">{{ info?.category }}</span>
      </div>
      <div class="flex justify-center mb-2">
        <button
          :disabled="info?.awaiting"
          class="btn btn-primary w-full rounded-xl text-[19px] font-normal ml-4 border-none hover:bg-primary bg-base-300 hover:text-base-100 text-neutral dark:bg-primary dark:text-gray-100"
          @click="
            navigateTo({
              path: `${page}/${info?.value}`,
              query: props.query,
            })
          "
        >
          {{ info?.awaiting ? 'Ожидается' : 'Добавить' }}
        </button>
      </div>
    </div>
  </div>
</template>
