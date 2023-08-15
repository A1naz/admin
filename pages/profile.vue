<!-- eslint-disable eqeqeq -->
<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Профиль',
})
const warning = ref('')

const store = useMainStore()
const wbApiKeys = ref([''])
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
  wbApiKeys.value = store.client.wbApiKeys.length ? JSON.parse(JSON.stringify(store.client.wbApiKeys)) : ['']
}
onMounted(async () => {
  updateInitital()
  form.firstName = store.client.firstName
  form.lastName = store.client.lastName
  form.email = store.client.email
  form.username = store.client.username
})
if (!store.checkTelegramId())
  warning.value = 'Пожалуйста перепривяжите Телеграм для корректной работы портала.'
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
    body: passwordForm,
    headers,
  })
  if ((data.value as any)?.status === 'error') {
    alert.show = true
    alert.message = (data.value as any).error!
    alert.type = 'error'
  }
  else {
    alert.show = true
    alert.message = 'Подтверждение смены пароля было отправлено на ваш email.'
    alert.type = 'success'
  }
  start()
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  await store.getClient()
}
async function setApiKey() {
  const { data, error } = await useFetch('/api/user/setApiKey', {
    method: 'POST',
    body: {
      wbApiKeys: wbApiKeys.value,
    },
    headers,
  })
  if (error.value) {
    alert.show = true
    alert.message = error.value?.data?.message
    alert.type = 'error'
  }
  else {
    alert.show = true
    alert.message = 'API ключи изменены.'
    alert.type = 'success'
  }
  start()
  await store.getClient()
  updateInitital()
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
    alert.message = 'Письмо для подтверждения было отправлено на указанный email. (Проверьте папку Спам)'
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
    <div v-if="warning" class="alert alert-warning mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <span>{{ warning }}</span>
    </div>
    <div class="page-header mb-16">
      <h1 class="text-2xl font-bold mt-4">
        Профиль       <div class="tooltip tooltip-bottom" data-tip="Видео-инструкция по профилю">
          <a class="hover:text-primary" href="https://youtu.be/cnFxy1Hieo8"><IconCSS size="24" class="h-8 w-8" name="uil:youtube" /></a>
        </div>
      </h1>
      <p class="description">
        Здесь вы можете управлять настройками вашего аккаунта.
      </p>
    </div>

    <section
      class="profile-options flex flex-col justify-center items-center gap-6 xl:gap-32 xl:pr-12 xl:flex-row xl:justify-between xl:items-start"
    >
      <div class="self-start description-container xl:basis-1/3">
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

        <div class="flex flex-col w-full gap-8 xl:flex-row">
          <input v-model="form.username" type="text" placeholder="Никнейм" class="input input-bordered w-full xl:w-1/2">
          <div class="tg w-full justify-between flex gap-2 xl:gap-4 xl:w-1/2">
            <div class="relative flex justify-end w-full items-center flex-grow-0">
              <input
                :value="store.client?.telegram ? `@${store.client.telegram}` : `${store.client.telegramUserId ?? ''}`" placeholder="Telegram"
                class="input input-bordered w-full" disabled
              >
              <Icon class="absolute mr-4" size="24" name="logos:telegram" />
            </div>

            <LinkTelegram v-if="!store.client.telegramUserId" @callback="onTelegramLink" />
            <button
              v-if="store.client.telegramUserId" class="btn btn-primary"
              @click="unlinkTelegram"
            >
              Отвязать
            </button>
          </div>
        </div>
        <input
          v-model="form.email" type="text" placeholder="Почта (email)"
          class="input input-bordered w-full"
        >

        <div class="flex w-full gap-4 justify-end">
          <button
            :disabled="disabledSaveButton" class="btn btn-primary  xl:w-40 mr-0 self-end"
            @click="update"
          >
            Сохранить
          </button>
        </div>
      </div>
    </section>
    <section
      class="profile-options mt-20 flex flex-col justify-center items-center gap-6 xl:gap-32 xl:pr-12 xl:flex-row xl:justify-between xl:items-start"
    >
      <div class="self-start description-container xl:basis-1/3">
        <div class="heading relative">
          Пароль
        </div>
        <div class="text-xs text-gray-400">
          Установите или поменяйте пароль для вашего аккаунта
        </div>
      </div>
      <div class="flex flex-col gap-6 w-full mt-1">
        <div class="w-full flex flex-col gap-4 xl:gap-8 xl:flex-row">
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
          :disabled="disabledChangePasswordButton" class="btn btn-primary xl:w-40 mr-0 self-end"
          @click="updatePassword"
        >
          {{ store.client.hasPassword ? 'Изменить'
            : 'Сохранить' }}
        </button>
      </div>
    </section>
    <section
      class="profile-options mt-20 flex flex-col justify-center items-center gap-6 xl:gap-32 xl:pr-12 xl:flex-row xl:justify-between xl:items-start"
    >
      <div class="self-start description-container xl:basis-1/3">
        <div class="heading relative">
          Настройки
        </div>
        <div class="text-xs text-gray-400">
          Введите стандартный ключ api для работы автоответчика
        </div>
      </div>
      <div class="flex flex-col gap-2 w-full">
        <div v-for="(key, index) of wbApiKeys" :key="key" class="flex flex-col gap-6 w-full mt-1 relative">
          <div class="flex gap-2 relative">
            <input
              v-model="wbApiKeys[index]"
              :disabled="store.client.wbApiKeys[index] === wbApiKeys[index]" type="text" placeholder="Стандартный апи ключ Wildberries"
              class="input input-bordered input-primary w-full"
            >

            <div
              v-if="index === 0"
              class="btn btn-primary btn-square"
              @click="wbApiKeys[0] = ''"
            >
              <IconCSS size="20" name="material-symbols:close" />
            </div>
            <div
              v-else
              class="btn btn-primary btn-square"
              @click="wbApiKeys.splice(index, 1)"
            >
              <IconCSS size="20" name="material-symbols:close" />
            </div>
            <div
              v-if="index === 0"
              class="btn btn-primary btn-square"
              @click="wbApiKeys.push('')"
            >
              <IconCSS size="20" name="fluent:add-20-filled" />
            </div>
          </div>
        </div>
        <button
          class="btn btn-primary xl:w-40 mr-0 self-end"
          @click="setApiKey"
        >
          Сохранить
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
