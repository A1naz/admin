<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

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
const emit = defineEmits(['callback', 'remove', 'openModal', 'archive', 'unarchive'])
const { $dayjs } = useNuxtApp()
const currency = useCurrency()
const router = useRouter()
function cloneBuyout() {
  router.push({
    path: '/buyouts/create',
    query: {
      uuid: props.info.uuid,
    },
  })
}
async function deleteBuyOut() {
  const { data, error } = await useFetch('/api/buyout/delete', {
    method: 'DELETE',
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
  else {
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно удален',
      type: 'success',
      duration: 3000,
    })
    emit('remove', props.info.uuid)
  }
}
async function unarchiveBuyout() {
  const { data, error } = await useFetch('/api/buyout/unarchive', {
    method: 'POST',
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
  else {
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно восстановлен',
      type: 'success',
      duration: 3000,
    })
    emit('unarchive', props.info.uuid)
  }
}
async function archiveBuyout() {
  const { data, error } = await useFetch('/api/buyout/archive', {
    method: 'POST',
    body: JSON.stringify({
      uuid: props.info.uuid,
    }),
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
  else {
    notify({
      title: 'Успешно',
      text: 'Выкуп успешно архивирован',
      type: 'success',
      duration: 3000,
    })
    emit('archive', props.info.uuid)
  }
}
const getStatus = computed(() => {
  switch (props.info.status) {
    case 'active':
      return 'Активный'
    case 'completed':
      return 'Завершен'
    case 'archived':
      return 'В архиве'
  }
})
</script>

<template>
  <div class="buyout-card card bg-base-200 shadow-lg">
    <div class="card-body flex-shrink-0 flex flex-col justify-start gap-4 p-4 relative">
      <div class="dropdown dropdown-end absolute right-2 top-2">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="18" />
        </label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            <a @click="cloneBuyout">
              <Icon name="fluent:copy-24-filled" />Дублировать
            </a>
          </li>
          <li v-if="info.status !== 'archived'">
            <a @click="archiveBuyout">
              <Icon name="material-symbols:archive" />Архивировать
            </a>
          </li>
          <li v-else>
            <a @click="unarchiveBuyout">
              <Icon name="material-symbols:unarchive" />Убрать из архива
            </a>
          </li>
          <li>
            <a
              @click="deleteBuyOut"
            >
              <Icon name="fluent:delete-24-filled" />Удалить
            </a>
          </li>
        </ul>
      </div>

      <div class="truncate">
        <h2 class="card-title">
          Выкуп №{{ info.place }}
        </h2>
        <div class="text-xs text-gray-500 truncate">
          #{{ info.uuid }}
        </div>
        <div class="flex justify-between mt-2">
          <span
            :class="{
              'text-green-600': info.status === 'active',
              'text-error': info.status === 'completed',
              'text-warning': info.status === 'archived',
            }"
          >{{ getStatus }}</span>

          <span class="text-sm text-gray-500">{{ $dayjs(info.createdAt).format('D MMMM HH:mm')
          }}</span>
        </div>
        <div v-show="info.status === 'active'" class="text-sm py-1 px-2  mt-2 bg-base-300 rounded-lg w-fit">
          Выкуплено {{ info.completed }} шт.
        </div>
      </div>

      <div class="flex gap-4">
        <div class="flex-none" style="width: 100px; height: 150px;">
          <nuxt-img
            class="rounded-xl h-full" width="100" height="150"
            format="webp"
            :src="info?.product?.image || '/logo/logocolor.svg'"
          />
        </div>
        <div class="flex flex-col justify-between truncate">
          <div class="mb-2">
            <div class=" truncate">
              {{ info.product?.name }}
            </div>
            <a
              :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
              class="text-sm text-secondary link link-hover"
            >
              {{ info.article }}
            </a>
          </div>
          <div class="">
            <div>
              <span class="text-sm text-gray-500">Цена: </span>
              <span class="">{{ info.product?.priceText }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-500">Количество: </span>
              <span class="">{{ info.quantity }} шт.</span>
            </div>
            <div>
              <span class="text-sm text-gray-500">Сумма: </span>
              <span class="">{{ currency.format(info.quantity * info.product?.price) }}</span>
            </div>
          </div>
        </div>
      </div>
      <button class="btn mt-2" @click="$emit('openModal', index)">
        Открыть
      </button>
    </div>
  </div>
</template>

<style scoped></style>
