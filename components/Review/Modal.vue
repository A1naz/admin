<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { UseImage } from '@vueuse/components'

const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'publish'])

const { notify } = useNotification()

const { $dayjs } = useNuxtApp()
const { upload, getPublicUrl, remove } = useS3Object()

const now = useNow()
const form = reactive({
  text: '',
  rating: 5,
  date: now.value,
  photos: [{
    url: '',
    public: '',
  }, {
    url: '',
    public: '',
  }, {
    url: '',
    public: '',
  }, {
    url: '',
    public: '',
  },
  {
    url: '',
    public: '',
  }],
})

const loadingIndex = ref(null) as Ref<number | null>

const fileInput = ref()
const url = ref('')
async function uploadToS3(event: Event, index: number) {
  loadingIndex.value = index
  const fileList = (event.target! as HTMLInputElement).files
  const files = Array.from(fileList!)
  if (!files)
    return
  const { data, error } = await upload({
    files,
    url: null,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: 'Не удалось загрузить фото',
      type: 'error',
      duration: 3000,
    })
  }
  if (data.value)
    form.photos[index] = { url: data.value[0].url, public: getPublicUrl(data.value[0].url) }

  loadingIndex.value = null
}
async function clearForm() {
  form.date = new Date()
  form.text = ''
  form.rating = 5
  const photos = form.photos

  for await (const [index, photo] of photos.entries()) {
    loadingIndex.value = index
    if (photo.url) {
      const { data, error } = await remove({
        url: photo.url,
      })
      if (error.value) {
        notify({
          title: 'Что-то пошло не так',
          text: 'Не удалось удалить фото',
          type: 'error',
          duration: 3000,
        })
        return
      }
    }
  }

  loadingIndex.value = null
  form.photos = [{
    url: '',
    public: '',
  }, {
    url: '',
    public: '',
  }, {
    url: '',
    public: '',
  }, {
    url: '',
    public: '',
  }, {
    url: '',
    public: '',
  }]
}

const headers = useRequestHeaders(['cookie']) as HeadersInit
async function publishReview() {
  const { data, error } = await useFetch('/api/review/publish', {
    method: 'POST',
    body: {
      ...form,
      buyoutuuid: props.uuid,
    },
    headers,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
    return
  }
  notify({
    title: 'Успешно',
    text: 'Отзыв успешно опубликован',
    type: 'success',
    duration: 3000,
  })
  emit('close')
  emit('publish')
}
async function removePhoto(index: number) {
  loadingIndex.value = index
  const url = form.photos[index].url

  form.photos[index] = {
    url: '',
    public: '',
  }
  const { data, error } = await remove({
    url,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: 'Не удалось удалить фото',
      type: 'error',
      duration: 3000,
    })
    return
  }
  if (data.value) {
    form.photos[index] = {
      url: '',
      public: '',
    }
  }
  loadingIndex.value = null
}

watch(() => props.uuid, (uuid) => {
  clearForm()
})
onMounted(() => {
  clearForm()
})
</script>

<template>
  <Teleport to="body">
    <input id="review-modal" type="checkbox" class="modal-toggle">
    <div
      :class="{
        'modal-open': state,
      }" class="modal"
    >
      <div class="modal-box">
        <label
          for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
          @click="$emit('close')"
        >✕</label>
        <h3 class="text-xl font-bold mb-4">
          Оставить отзыв
        </h3>
        <div class="flex flex-col gap-4">
          <div class="w-full">
            <div class="pb-2">
              Отзыв от товаре
            </div>
            <textarea
              v-model="form.text" class="textarea w-full textarea-md bg-base-200"
              placeholder="Например, хороший телефон"
            />
            <label class="label py-0"> <span class="label-text-alt" />
              <span class="label-text-alt">От до 10 до 1000 символов</span></label>
          </div>

          <div>
            <div class="pb-2">
              Рейтинг
            </div>
            <div class="relative w-full p-6 bg-base-200 rounded-lg">
              <div class="absolute left-3 top-3 text-gray-400">
                Оценка
              </div>
              <div class="rating absolute right-3 top-3">
                <input
                  type="radio" name="rating-2" class="mask mask-star-2 bg-yellow-400"
                  @input="form.rating = 1"
                >
                <input
                  type="radio" name="rating-2" class="mask mask-star-2 bg-yellow-400"
                  @input="form.rating = 2"
                >
                <input
                  type="radio" name="rating-2" class="mask mask-star-2 bg-yellow-400"
                  @input="form.rating = 3"
                >
                <input
                  type="radio" name="rating-2" class="mask mask-star-2 bg-yellow-400"
                  @input="form.rating = 4"
                >
                <input
                  type="radio" name="rating-2" class="mask mask-star-2 bg-yellow-400"
                  checked @input="form.rating = 5"
                >
              </div>
            </div>
          </div>

          <div>
            <div class="pb-2">
              Запланировать отзыв
            </div>
            <div class="relative w-full p-6 bg-base-200 rounded-lg">
              <div class="absolute left-3 top-3">
                {{ form.date <= now ? 'Опубликовать сейчас'
                  : $dayjs(form.date).format('D MMMM HH:mm') }}
              </div>
              <div class="absolute right-3 top-2 w-30" style="z-index: 9999999">
                <DatePicker v-model="form.date" />
              </div>
            </div>
          </div>
          <div>
            <div class="pb-2">
              Фото
            </div>
            <ClientOnly>
              <div
                class="flex gap-2 items-center overflow-x-scroll flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]"
              >
                <div v-for="(photo, index) of form.photos" :key="index">
                  <div
                    class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-32 h-32 hover:bg-base-200 rounded-lg flex-none"
                  >
                    <div
                      v-if="photo.url" class="absolute right-0 top-0 z-50"
                      @click="removePhoto(index)"
                    >
                      <label for="photo" class="btn btn-sm btn-circle btn-ghost">✕</label>
                    </div>

                    <label
                      v-show="!photo.public"
                      class="file-select w-full h-full flex justify-center items-center hover:cursor-pointer"
                    >
                      <div
                        v-show="loadingIndex === index"
                        class="absolute inset-0 flex items-center justify-center"
                      >
                        <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
                      </div>
                      <input
                        :ref="`fileInput${index}`" type="file"
                        class="hidden" @change="(e: Event) => uploadToS3(e, index)"
                      >
                      <IconCSS
                        v-show="loadingIndex !== index"
                        name="material-symbols:add-photo-alternate-outline" size="30"
                      />
                    </label>

                    <div v-show="photo.public" class="absolute inset-0">
                      <UseImage :src="photo.public">
                        <template #default>
                          <nuxt-img
                            :src="photo.public" fit="contain"
                            class="w-full h-full object-contain rounded-lg"
                          />
                        </template>
                        <template #loading>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
                          </div>
                        </template>
                        <template #error>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-red-500 text-center">
                              Ошибка загрузки
                            </div>
                          </div>
                        </template>
                      </UseImage>
                    </div>
                  </div>
                </div>
              </div>
            </ClientOnly>
          </div>
        </div>
        <div class="modal-action justify-between">
          <div>
            <button class="btn btn-sm btn-ghost btn-outline" @click="clearForm">
              Сбросить
            </button>
          </div>
          <div class="flex gap-2">
            <label for="review-modal" class="btn btn-sm btn-ghost" @click="$emit('close')">Отмена</label>
            <label
              for="review-modal" class="btn btn-primary btn-sm"
              @click="publishReview"
            >Отправить</label>
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
