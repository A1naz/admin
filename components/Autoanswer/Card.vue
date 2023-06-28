<script setup lang="ts">
interface Iinfo {
  place: number
  rating: [number, number]
  product: any
  text: string
  article: string | number
}
const props = defineProps<{
  info: any
}>()
const emit = defineEmits(['delete'])
const getStatus = computed(() => {
  switch (props.info.status) {
    case 'created':
      return 'Создан'
    case 'stopped':
      return 'Остановлен'
    case 'work':
      return 'Работает'
    case 'error':
      return 'Ошибка'
  }
})
</script>

<template>
  <div class="card w-full bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title flex">
        <nuxt-img
          fit="fill" :src="info?.product.image" width="36"
          loading="lazy"
          class="rounded-lg transition-opacity ease-in-out duration-200"
        />
        <div>
          <div>
            Автоответчик  №{{ info.place }}
          </div>
          <div class="text-sm">
            Артикул: <a
              :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
              class=" text-secondary link link-hover"
            >
              {{ info.article }}
            </a>
          </div>
        </div>
      </h2>
      <div class="flex items-center mt-2 gap-1">
        Рейтинг: <span>От {{ info.rating[0] }} </span><Icon color="rgb(250 204 21)" size="20" name="fluent:star-24-filled" />
        <span>До {{ info.rating[1] }} </span><Icon color="rgb(250 204 21)" size="20" name="fluent:star-20-filled" />
      </div>
      <div class="flex flex-col gap-2">
        <p class="p-2 bg-base-200 rounded-lg break-all">
          {{ info.text }}
        </p>
      </div>

      <div class="card-actions justify-between items-center mt-2">
        <span
          :class="{

            'bg-primary': info.status === 'work',
            'text-primary-content': info.status === 'work',

            'bg-warning': info.status === 'created',
            'bg-error': info.status === 'error',
          }" class="text-black p-1 px-8 rounded-lg text-center"
        >{{ getStatus }}  </span>
        <span v-if="info.status === 'error'">Проверьте апи ключ в настройках профиля и пересоздайте автоответчик</span>
        <button class="btn btn-primary btn-sm" @click="emit('delete', info.id)">
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
