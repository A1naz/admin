<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    requited: true,
  },
})
const store = useMainStore()
const text = ref('')
watch(() => store.infoType, () => {
  switch (store.infoType) {
    case 'buyouts':
      text.value = 'Создавайте выкупы легче, проще, быстрее и эффективнее используя простые рекомендации. Просмотрите видео-инструкцию для изучения деталей по созданию выкупов'
      break
    case 'deliveries':
      text.value = 'Отслеживайте ваши товары и забирайте до 5 дней с момента прибытия на ПВЗ. Просмотрите видео-инструкцию для изучения деталей по заборам товаров'
      break
    case 'reviews':
      text.value = 'Публикуйте отзывы на ваши товары, используя планировщик. Просмотрите видео-инструкцию для изучения деталей по публикации отзывов'
      break
    case 'paymenthistory':
      text.value = 'Отслеживайте всю финансовую отчетность вашего кабинета в одном месте. Просмотрите видео-инструкцию для изучения деталей по финансовым операциям'
      break
  }
})
const title = computed(() => {
  if (store.infoType === 'buyouts')
    return 'Выкупы'
  else if (store.infoType === 'deliveries')
    return 'Доставки'
  else if (store.infoType === 'reviews')
    return 'Отзывы'
  else if (store.infoType === 'paymenthistory')
    return 'История платежей'
})
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  store.infoModal = false
})
</script>

<template>
  <input id="infoModal" type="checkbox" class="modal-toggle">
  <div
    :class="{
      'modal-open': state,
    }"
    class="modal"
  >
    <div class="modal-box w-6/12 max-w-4xl">
      <label
        for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="store.infoModal = false"
      >✕</label>
      <h1 class="text-xl font-bold">
        {{ title }}
      </h1>
      <p>{{ text }}</p>

      <iframe class="w-full h-[30rem] rounded-lg my-4" src="https://www.youtube.com/embed/nE1GQd6XV9Y?si=fjE2fbBAPomggp_n" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen />
    </div>
    <label class="modal-backdrop" for="infoModal" @click="store.infoModal = false">Close</label>
  </div>
</template>

<style scoped>

</style>
