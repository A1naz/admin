<script setup lang="ts">
import Rating from 'primevue/rating'

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  addLikes: {
    type: Number,
    required: true,
  },
  addDislikes: {
    type: Number,
    required: true,
  },

})
const emit = defineEmits(['addLike', 'removeLike', 'addDislike', 'removeDislike'])
const { $dayjs } = useNuxtApp()

const disabledMinusLikes = computed(() => {
  return props.addLikes <= 0
})
const disabledMinusDislikes = computed(() => {
  return props.addDislikes <= 0
})
function addLike() {
  emit('addLike', props.info.id)
}
function removeLike() {
  emit('removeLike', props.info.id)
}

function addDislike() {
  emit('addDislike', props.info.id)
}
function removeDislike() {
  emit('removeDislike', props.info.id)
}
</script>

<template>
  <div class="flex border gap-4 border-base-200 bg-base-100 rounded-lg p-4">
    <div class="photo">
      <div class="w-12 h-12 photo-container">
        <!-- <nuxt-img class="rounded-xl" src="/img/Profile.png" /> -->
        <Icon name="mdi:account" size="40" class="bg-base-300 p-2 rounded-full opacity-40" />
      </div>
    </div>
    <div class="review flex flex-col w-full">
      <div class="flex justify-between items-center">
        <div class="userinfo">
          <div class="name font-bold">
            {{ info.user.name }}
          </div>
        </div>
        <div class="date text-gray-500 text-sm">
          {{ $dayjs(info.date).calendar() }}
        </div>
      </div>
      <div class="relative w-full rounded-lg">
        <Rating class="text-yellow-400" :cancel="false" :model-value="info.rating" />
      </div>
      <p class="text text-sm mt-2 h-28 overflow-auto rounded-lg py-2">
        {{ info.text }}
      </p>
      <div class="rank mt-6 flex flex-col xl:flex-row justify-between gap-6 items-center">
        <div class="likes flex gap-2 items-center w-full">
          <span class="emoji">👍</span>
          <span>Лайков:</span>
          <div class="relative flex items-center ml-auto">
            <button
              :disabled="disabledMinusLikes" class="absolute left-0 btn btn-ghost btn-sm btn-square"
              @click="removeLike"
            >
              <IconCSS size="16" name="ic:round-minus" />
            </button>
            <div class="input-sm rounded-lg w-24 text-center bg-base-200">
              {{ info.likes + addLikes }}
            </div>
            <div class="absolute right-0 btn btn-ghost btn-sm btn-square" @click="addLike">
              <IconCSS size="16" name="ic:round-plus" />
            </div>
          </div>
        </div>
        <div class="dislikes flex gap-2 items-center w-full">
          <span class="emoji">👎</span>
          <span>Дизлайков:</span>
          <div class="relative flex items-center ml-auto">
            <button
              :disabled="disabledMinusDislikes" class="absolute left-0 btn btn-ghost btn-sm btn-square"
              @click="removeDislike"
            >
              <IconCSS size="16" name="ic:round-minus" />
            </button>
            <div class="input-sm rounded-lg w-24 text-center bg-base-200">
              {{ info.dislikes + addDislikes }}
            </div>
            <div class="absolute right-0 btn btn-ghost btn-sm btn-square" @click="addDislike">
              <IconCSS size="16" name="ic:round-plus" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
