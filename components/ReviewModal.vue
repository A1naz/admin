<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification';
import { UseImage } from '@vueuse/components'

const { $dayjs } = useNuxtApp()

const now = useNow()
const form = reactive({
    text: '',
    rating: 5,
    date: now.value,
    photos: ['', '', '', '', ''] as string[],
})

const props = defineProps({
    state: {
        type: Boolean,
        required: true
    },
    uuid: {
        type: String,
        required: true
    }
})
const compressImage = async (file: File, { quality = 1, type = file.type }) => {
    // Get as image data
    const imageBitmap = await createImageBitmap(file);

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    ctx!.drawImage(imageBitmap, 0, 0);

    // Turn into Blob
    const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, type, quality)
    ) as any

    // Turn Blob into File
    return new File([blob], file.name, {
        type: blob.type,
    });
};
const loading = ref(false)
const emit = defineEmits(['close', 'publish'])
const fileInput = ref()
const uploadPhoto = async (e: Event, index: number) => {
    loading.value = true
    const file = (e.target! as HTMLInputElement).files![0]
    const compressed = await compressImage(file, {
        quality: 0.7,
        type: file.type
    })
    const { base64 } = useBase64(compressed)
    const { data, error } = await useFetch('/api/upload',
        {
            method: 'POST',
            headers,
            body: {
                data: base64,
                type: file.type
            }
        })
    if (error.value) {
        if (error.value.statusCode === 413) {
            notify({
                title: 'Что-то пошло не так',
                text: 'Фото слишком большое',
                type: 'error',
                duration: 3000
            })
            return
        }
        notify({
            title: 'Что-то пошло не так',
            text: 'Не удалось загрузить фото',
            type: 'error',
            duration: 3000
        })
    }
    if (data.value) {
        form.photos[index] = data.value?.url!
    }



    console.log(form.photos)
}
const clearForm = () => {
    form.date = new Date()
    form.text = ''
    form.rating = 5
    form.photos = ['', '', '', '', '']
}
const { notify } = useNotification()

const headers = useRequestHeaders(['cookie']) as HeadersInit
const publishReview = async () => {
    const { data, error } = await useFetch('/api/review/publish', {
        method: 'POST',
        body: {
            ...form,
            buyoutuuid: props.uuid
        },
        headers
    })
    if (error.value) {
        notify({
            title: 'Что-то пошло не так',
            text: error.value?.data?.message,
            type: 'error',
            duration: 3000
        })
        return
    }
    notify({
        title: 'Успешно',
        text: 'Отзыв успешно опубликован',
        type: 'success',
        duration: 3000
    })
    emit('close')
    emit('publish')
}
const removePhoto = async (index: number) => {
    const url = form.photos[index]
    form.photos[index] = ''
    const { data, error } = await useFetch(url, {
        method: 'DELETE',
        headers
    })
    if (error.value) {
        notify({
            title: 'Что-то пошло не так',
            text: error.value?.data?.message,
            type: 'error',
            duration: 3000
        })
        return
    }

}

watch(() => props.uuid, (uuid) => {
    clearForm()
    console.log(uuid)
})
onMounted(() => {
    clearForm()
    console.log(props.uuid)
})

</script>
<template>
    <Teleport to="body">
        <input type="checkbox" id="review-modal" class="modal-toggle" />
        <div :class="{
            'modal-open': state
        }" class="modal">
            <div class="modal-box">
                <label @click="$emit('close')" for="review-modal"
                    class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost">✕</label>
                <h3 class="text-xl font-bold mb-4">Оставить отзыв</h3>
                <div class="flex flex-col gap-4">

                    <div class="w-full">
                        <div class="pb-2">Отзыв от товаре</div>
                        <textarea class="textarea w-full textarea-md bg-base-200" v-model="form.text"
                            placeholder="Например, хороший телефон"></textarea>
                    </div>

                    <div>
                        <div class="pb-2">Рейтинг</div>
                        <div class="relative w-full p-6 bg-base-200 rounded-lg">
                            <div class="absolute left-3 top-3 text-gray-400">Оценка </div>
                            <div class="rating absolute right-3 top-3">
                                <input @input="form.rating = 1" type="radio" name="rating-2"
                                    class="mask mask-star-2 bg-yellow-400" />
                                <input @input="form.rating = 2" type="radio" name="rating-2"
                                    class="mask mask-star-2 bg-yellow-400" />
                                <input @input="form.rating = 3" type="radio" name="rating-2"
                                    class="mask mask-star-2 bg-yellow-400" />
                                <input @input="form.rating = 4" type="radio" name="rating-2"
                                    class="mask mask-star-2 bg-yellow-400" />
                                <input @input="form.rating = 5" type="radio" name="rating-2"
                                    class="mask mask-star-2 bg-yellow-400" checked />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="pb-2">Запланировать отзыв</div>
                        <div class="relative w-full p-6 bg-base-200 rounded-lg">
                            <div class="absolute left-3 top-3">{{ form.date <= now ? 'Опубликовать сейчас' :
                                $dayjs(form.date).format('D MMMM HH:mm') }}</div>
                                    <div class="absolute right-3 top-2 w-30" style="z-index: 9999999">
                                        <DatePicker v-model="form.date" />
                                    </div>
                            </div>
                        </div>
                        <div>
                            <div class="pb-2">Фото</div>

                            <div
                                class="flex gap-2 items-center overflow-x-scroll flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]">
                                <div v-for="(photo, index) of form.photos">

                                    <div
                                        class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-32 h-32 hover:bg-base-200 rounded-lg flex-none">
                                        <div @click="removePhoto(index)" v-if="photo" class="absolute right-0 top-0 z-50">
                                            <label for="photo" class="btn btn-sm btn-circle btn-ghost">✕</label>
                                        </div>

                                        <label v-if="!photo"
                                            class="file-select w-full h-full flex justify-center items-center hover:cursor-pointer">
                                            <input @input="uploadPhoto($event, index)" :ref="'fileInput' + index"
                                                accept="image/*" type="file" class="hidden">
                                            <IconCSS name="material-symbols:add-photo-alternate-outline" size="30">
                                            </IconCSS>
                                        </label>

                                        <div v-else class="absolute inset-0">
                                            <UseImage :src="photo">
                                                <template #default>
                                                    <nuxt-img :src="photo"
                                                        class="w-full h-full object-contain rounded-lg" />
                                                </template>
                                                <template #loading>
                                                    <div class="absolute inset-0 flex items-center justify-center">
                                                        <Icon name="mdi:loading" class="h-8 w-8 animate-spin">
                                                        </Icon>
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-action justify-between">
                        <div>
                            <button @click="clearForm" class="btn btn-sm btn-ghost btn-outline">Сбросить</button>
                        </div>
                        <div class="flex gap-2">
                            <label @click="$emit('close')" for="review-modal" class="btn btn-sm btn-ghost">Отмена</label>
                            <label @click="publishReview" for="review-modal"
                                class="btn btn-primary btn-sm">Отправить</label>
                        </div>

                    </div>


                </div>
            </div>
    </Teleport>
</template>


<style scoped>
input[type=file]::file-selector-button {
    display: none;
}

input[type=file]::-webkit-file-upload-button {
    display: block;
    width: 0;
    height: 0;
    margin-left: -100%;
}

input[type=file]::-ms-browse {
    display: none;
}
</style>