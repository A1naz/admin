<script setup lang="ts">
const { $dayjs } = useNuxtApp()
const props = defineProps({
    info: {
        type: Object as any,
        required: true
    },
    index: {
        type: Number,
        required: true
    }

})

const emit = defineEmits(['addLike', 'removeLike', 'addDislike', 'removeDislike'])
const addLikes = ref(0)
const addDislikes = ref(0)

const disabledMinusLikes = computed(() => {
    return addLikes.value <= 0
})
const disabledMinusDislikes = computed(() => {
    return addDislikes.value <= 0
})
const addLike = () => {
    addLikes.value++
    emit('addLike', props.info.id)
}
const removeLike = () => {
    addLikes.value--
    emit('removeLike', props.info.id)
}

const addDislike = () => {
    addDislikes.value++
    emit('addDislike', props.info.id)
}
const removeDislike = () => {
    addDislikes.value--
    emit('removeDislike', props.info.id)
}
watchEffect(() => {
    if (addLikes.value > 0) {
        addDislikes.value = 0
    }
})
</script>

<template>
    <li>
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
                        <div class="name font-bold">{{ info.user.name }}</div>
                    </div>
                    <div class="date text-gray-500 text-sm">{{ $dayjs(info.date).calendar() }}</div>
                </div>
                <div class="relative w-full rounded-lg">
                    <div class="rating rating-sm">
                        <input type="radio" disabled :checked="info.rating === 1" :name="'rating' + index"
                            class="mask mask-star-2 bg-yellow-400" />
                        <input type="radio" disabled :checked="info.rating === 2" :name="'rating' + index"
                            class="mask mask-star-2 bg-yellow-400" />
                        <input type="radio" disabled :checked="info.rating === 3" :name="'rating' + index"
                            class="mask mask-star-2 bg-yellow-400" />
                        <input type="radio" disabled :checked="info.rating === 4" :name="'rating' + index"
                            class="mask mask-star-2 bg-yellow-400" />
                        <input type="radio" disabled :checked="info.rating === 5" :name="'rating' + index"
                            class="mask mask-star-2 bg-yellow-400" />
                    </div>
                </div>
                <p class="text text-sm mt-2 h-28 overflow-auto rounded-lg py-2">
                    {{ info.text }}
                </p>
                <div class="rank mt-6 flex flex-col xl:flex-row justify-between gap-6 items-center">
                    <div class="likes flex gap-2 items-center w-full">
                        <span class="emoji">👍</span>
                        <span>Лайков:</span>
                        <div class="relative flex items-center ml-auto">
                            <button :disabled="disabledMinusLikes" @click="removeLike"
                                class="absolute left-0 btn btn-ghost btn-sm btn-square">

                                <IconCSS size="16" name="ic:round-minus" />
                            </button>
                            <div class="input-sm rounded-lg w-24 text-center bg-base-200">
                                {{ info.likes + addLikes }}
                            </div>
                            <div @click="addLike" class="absolute right-0 btn btn-ghost btn-sm btn-square">
                                <IconCSS size="16" name="ic:round-plus" />

                            </div>

                        </div>
                    </div>
                    <div class="dislikes flex gap-2 items-center w-full">
                        <span class="emoji">👎</span>
                        <span>Дизлайков:</span>
                        <div class="relative flex items-center ml-auto">
                            <button :disabled="disabledMinusDislikes" @click="removeDislike"
                                class="absolute left-0 btn btn-ghost btn-sm btn-square">

                                <IconCSS size="16" name="ic:round-minus" />
                            </button>
                            <div class="input-sm rounded-lg w-24 text-center bg-base-200">
                                {{ info.dislikes + addDislikes }}
                            </div>
                            <div @click="addDislike" class="absolute right-0 btn btn-ghost btn-sm btn-square">
                                <IconCSS size="16" name="ic:round-plus" />

                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </div>
    </li>
</template>

<style scoped></style>