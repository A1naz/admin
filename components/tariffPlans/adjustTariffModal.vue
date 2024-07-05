<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const { upload, getPublicUrl } = useS3Object()

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedUser: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(['update:isModalOpen', 'getTariffs'])

const screenshot = ref({
  url: 'null',
  public: 'null',
})

const config = useRuntimeConfig()
const loadingIndex = ref(false)
const postForm = ref({
  mp: '',
  tariff: '',
  type: '',
  timeLimit: 0,
  activationDate: new Date(),
  paymentDate: new Date(),
})

postForm.value.activationDate.setHours(12, 0, 0, 0)
postForm.value.paymentDate.setHours(12, 0, 0, 0)

const close = () => {
  emit('update:isModalOpen', false)
}

const screenshotInput: any = ref(null)
const screen = ref(false)
const isNextDisabled = computed(() => {
  return (
    !postForm.value.mp ||
    !postForm.value.tariff ||
    !postForm.value.type ||
    !postForm.value.timeLimit ||
    !postForm.value.activationDate ||
    !postForm.value.paymentDate
  )
})
async function save() {
  if (isNextDisabled.value) {
    notify({
      title: 'Ошибка',
      text: 'Заполните все поля',
      type: 'error',
    })
    return
  }
  const { data }: any = await useFetch('/api/tariffPlans/save', {
    method: 'POST',
    body: {
      ...postForm.value,
      userUuid: props.selectedUser.uuid,
      screenshot: screenshot.value.public.replace(config.public.IMAGES_URL, ''),
    },
  })
  if (data.value) {
    notify({
      title: 'Успешно',
      text: 'Пакет добавлен',
      type: 'success',
    })
    postForm.value = {
      mp: '',
      tariff: '',
      type: '',
      timeLimit: 0,
      activationDate: new Date(),
      paymentDate: new Date(),
    }
    screenshot.value = {
      url: 'null',
      public: 'null',
    }
    screen.value = false
    emit('getTariffs')
    close()
  } else {
    notify({
      title: 'Ошибка',
      text: 'Не удалось сохранить пакет',
      type: 'error',
    })
  }
}

function openFileInput() {
  screenshotInput.value?.click()
}

async function uploadToS3(event: Event) {
  loadingIndex.value = true
  const fileList = (event.target! as HTMLInputElement).files
  const files = Array.from(fileList!)
  if (!files) return
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
  if (data.value) {
    const publicUrl: any = await getS3PublicUrl(data.value[0].key)

    screenshot.value = {
      url: publicUrl,
      public: publicUrl,
    }
  }

  loadingIndex.value = false
}
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40"
    :class="{ 'modal-open': isModalOpen }"
  >
    <div
      class="modal-box w-9/12 max-w-[500px] min-h-[500px] cursor-auto"
      @click.stop
    >
      <form method="dialog" class="flex justify-between">
        <label
          class="btn btn-sm btn-circle btn-ghost absolute left-2 top-2"
          @click="screen = false"
        >
          <Icon name="ep:back" size="20" />
        </label>
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div v-if="!screen">
        <div class="text-xl text-center">Добавление пакета</div>
        <div class="text-center mt-1">{{ selectedUser.username }}</div>
        <div class="px-5 mt-5">
          <select class="select select-bordered w-full" v-model="postForm.mp">
            <option disabled selected value="">Выберите МП</option>
            <option value="wildberries">Wildberries</option>
            <option value="ozon">Ozon</option>
          </select>
          <select
            class="select select-bordered w-full mt-2"
            v-model="postForm.tariff"
          >
            <option disabled selected value="">Выберите тариф</option>
            <option value="launch">Запуск</option>
            <option value="increase">Рост</option>
            <option value="support">Поддержка</option>
          </select>
          <select
            class="select select-bordered w-full mt-2"
            v-model="postForm.type"
          >
            <option disabled selected value="">Выберите услугу</option>
            <option value="basic">Базовый</option>
            <option value="full">Под ключ</option>
          </select>
          <select
            class="select select-bordered w-full mt-2"
            v-model="postForm.timeLimit"
          >
            <option disabled selected :value="0">Выберите срок</option>
            <option :value="1">1 месяц</option>
            <option :value="3">3 месяца</option>
            <option :value="6">6 месяцев</option>
            <option :value="12">12 месяцев</option>
          </select>
          <div class="w-full mt-2 flex">
            <label
              type="text"
              class="input input-bordered w-full flex cursor-pointer"
            >
              <span class="w-full mt-2"> Выберите дату активации </span>

              <div class="-mr-4">
                <DateOnlyPicker
                  ref="datePicker"
                  :modelValue="postForm.activationDate"
                  :min-date="new Date(Date.now() - 1000 * 60 * 60 * 24)"
                  :size="'sm'"
                  @update:modelValue="postForm.activationDate = $event"
                />
              </div>
            </label>
          </div>
          <div class="w-full mt-2 flex">
            <label
              type="text"
              class="input input-bordered w-full flex cursor-pointer"
            >
              <span class="w-full mt-2"> Выберите дату оплаты </span>

              <div class="-mr-4">
                <DateOnlyPicker
                  ref="datePicker"
                  :modelValue="postForm.paymentDate"
                  :min-date="new Date(Date.now() - 1000 * 60 * 60 * 24)"
                  :size="'sm'"
                  @update:modelValue="postForm.paymentDate = $event"
                />
              </div>
            </label>
          </div>
        </div>
        <div class="modal-action flex justify-center">
          <button
            class="btn btn-primary text-[16px] w-[300px] -mb-8"
            @click="screen = true"
            :disabled="isNextDisabled"
          >
            Далее
          </button>
        </div>
      </div>
      <div v-else>
        <div class="text-xl text-center mt-1">
          Скриншот чека операции клиента
        </div>
        <div class="flex justify-center mt-4" style="min-height: 200px">
          <div
            style="width: 300px; height: 300px"
            @click="openFileInput"
            :class="`cursor-pointer flex justify-center border-neutral mt-10 ${
              screenshot.public === 'null' ? 'border-2' : ''
            } rounded-lg`"
          >
            <nuxt-img
              v-if="screenshot.public !== 'null'"
              class="max-w-lg rounded-lg my-2 px-1"
              style="display: block; max-height: 300px"
              :src="screenshot.public"
            />
            <span
              v-if="loadingIndex && screenshot.public === 'null'"
              class="loading loading-spinner text-primary absolute mt-32"
            />
            <IconCSS
              style="max-height: 300px"
              v-show="screenshot.public === 'null'"
              class="mt-28"
              :name="
                loadingIndex == true
                  ? ''
                  : 'material-symbols:add-photo-alternate-outline'
              "
              size="70"
            />
          </div>
        </div>
        <ClientOnly>
          <div>
            <input
              type="file"
              accept="image/png, image/gif, image/jpeg"
              ref="screenshotInput"
              class="hidden"
              @change="(e) => uploadToS3(e)"
            />
          </div>
        </ClientOnly>
      </div>
      <div class="modal-action flex justify-center mt-12">
        <button
          class="btn btn-primary text-[16px] w-[300px]"
          @click="save"
          v-if="screen"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>
