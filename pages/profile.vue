<!-- eslint-disable eqeqeq -->
<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Профиль',
})

const store = useMainStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
})
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
})
const alert = reactive({
  show: false,
  message: '',
  type: 'success',
})
const { start, stop } = useTimeoutFn(() => {
  alert.show = false
}, 3000, { immediate: false })
const initialForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
})
function updateInitital() {
  initialForm.firstName = store.client.firstName
  initialForm.lastName = store.client.lastName
  initialForm.email = store.client.email
  initialForm.username = store.client.username
}
onMounted(async () => {
  updateInitital()
})
const headers = useRequestHeaders(['cookie']) as HeadersInit
const disabledSaveButton = computed(() => {
  return form.firstName == initialForm.firstName && form.lastName == initialForm.lastName && form.email == initialForm.email && form.username == initialForm.username
})
const disabledChangePasswordButton = computed(() => {
  if (store.client.hasPassword)
    return passwordForm.oldPassword == '' || passwordForm.newPassword == ''
  else
    return passwordForm.newPassword == ''
})

async function updatePassword() {
  if (passwordForm.oldPassword == '' && passwordForm.newPassword == '')
    return

  const { data, error } = await useFetch('/api/user/updatePassword', {
    method: 'POST',
    body: JSON.stringify(passwordForm),
    headers,
  })
  if ((data.value as any)?.status === 'error') {
    alert.show = true
    alert.message = (data.value as any).error!
    alert.type = 'error'
  }
  else {
    alert.show = true
    alert.message = 'Пароль успешно изменен'
    alert.type = 'success'
  }
  start()
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  await store.getClient()
}
async function update() {
  if (form.firstName == store.client.firstName && form.lastName == store.client.lastName && form.email == store.client.email && form.username == store.client.username)
    return

  const { data, error } = await useFetch('/api/user/update', {
    method: 'POST',
    body: form,
    headers,
  })
  if (error.value) {
    alert.show = true
    alert.message = error.value?.data?.message
    alert.type = 'error'
  }
  else {
    alert.show = true
    alert.message = 'Данные успешно обновлены'
    alert.type = 'success'
  }
  start()
  await store.getClient()
  updateInitital()
}
async function unlinkTelegram() {
  const { data, error } = await useFetch('/api/user/unlinkTelegram', {
    method: 'POST',
    headers,
  })
  if (error.value) {
    alert.show = true
    alert.message = error.value?.data?.message
    alert.type = 'error'
  }
  else {
    alert.show = true
    alert.message = 'Telegram успешно отвязан'
    alert.type = 'success'
  }
  start()
  await store.getClient()
}
function onTelegramLink(data: any) {
  if (data.status === 'ok') {
    alert.show = true
    alert.message = 'Telegram успешно привязан'
    alert.type = 'success'
  }
  else {
    alert.show = true
    alert.message = data.error.data?.message || 'Произошла ошибка'
    alert.type = 'error'
  }
  start()
}
</script>

<template>
  <div>
    <Toast :type="alert.type" :active="alert.show">
      {{ alert.message }}
    </Toast>
    <div class="page-header mb-16">
      <h1 class="title">
        Профиль
      </h1>
      <p class="description">
        Здесь вы можете управлять настройками вашего аккаунта.
      </p>
    </div>
    <section
      class="profile-options flex flex-col justify-center items-center gap-6 lg:gap-32 lg:pr-12 lg:flex-row lg:justify-between lg:items-start"
    >
      <div class="self-start description-container lg:basis-1/3">
        <div class="heading">
          Контактные данные
        </div>
        <div class="text-xs text-gray-400">
          Заполните свои контактные данные, чтобы получать актуальные рекомендации
          по
          продвижению
        </div>
      </div>
      <div class="flex flex-col gap-6 w-full mt-1">
        <div class="w-full flex gap-8">
          <input v-model="form.firstName" placeholder="Имя" class="input input-bordered w-full">
          <input v-model="form.lastName" placeholder="Фамилия" class="input input-bordered w-full">
        </div>

        <div class="email flex flex-col gap-8 lg:flex-row">
          <input v-model="form.username" type="text" placeholder="Никнейм" class="input input-bordered w-full">
          <input
            v-model="form.email" type="text" placeholder="Почта (email)"
            class="input input-bordered w-full"
          >
        </div>
        <div class="flex flex-col w-full gap-4 justify-between xl:flex-row">
          <div class="tg w-full justify-between flex gap-2 lg:gap-4 xl:w-1/2">
            <div class="relative flex justify-end w-full items-center flex-grow-0">
              <input
                :value="store.client?.telegram ? `@${store.client.telegram}` : ''" placeholder="Telegram"
                class="input input-bordered w-full" disabled
              >
              <Icon class="absolute mr-4" size="24" name="logos:telegram" />
            </div>

            <LinkTelegram v-if="!store.client.telegram" class="lg:mr-4" @callback="onTelegramLink" />
            <button
              v-if="store.client.telegram" class="btn btn-primary xl:mr-4"
              @click="unlinkTelegram"
            >
              Отвязать
            </button>
          </div>
          <button
            :disabled="disabledSaveButton" class="btn btn-primary  lg:w-40 mr-0 self-end"
            @click="update"
          >
            Сохранить
          </button>
        </div>
      </div>
    </section>
    <section
      class="profile-options mt-20 flex flex-col justify-center items-center gap-6 lg:gap-32 lg:pr-12 lg:flex-row lg:justify-between lg:items-start"
    >
      <div class="self-start description-container lg:basis-1/3">
        <div class="heading relative">
          Пароль
        </div>
        <div class="text-xs text-gray-400">
          Установите или поменяйте пароль для вашего аккаунта
        </div>
      </div>
      <div class="flex flex-col gap-6 w-full mt-1">
        <div class="w-full flex flex-col gap-4 lg:gap-8 lg:flex-row">
          <input
            v-show="store.client.hasPassword" v-model="passwordForm.oldPassword" type="password"
            placeholder="Старый пароль" class="input input-bordered w-full"
          >
          <input
            v-model="passwordForm.newPassword"
            :class="{
              'input-primary': !store.client.hasPassword,
            }" type="password" placeholder="Новый пароль"
            class="input  input-bordered w-full"
          >
        </div>

        <button
          :disabled="disabledChangePasswordButton" class="btn btn-primary lg:w-40 mr-0 self-end"
          @click="updatePassword"
        >
          {{ store.client.hasPassword ? 'Изменить'
            : 'Сохранить' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
