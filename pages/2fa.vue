<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'
const { signOut, signIn } = useAuth()
const store = useMainStore()

if (!store.client || !store.client.uuid) {
  await signOut()
}

definePageMeta({
  title: 'Двухфакторная аутентификация',
  auth: true,
})

const codeInput = ref()
const code = ref('')
const colorMode = useColorMode()

onMounted(() => {
  codeInput.value?.focus()
})

async function confirm2fa() {
  if (!code.value) {
    return
  }

  if (code.value.length < 6) {
    notify({
      title: 'Код должен содержать 6 цифр',
    })
    return
  }

  const { error, url } = await signIn('2fa', {
    redirect: false,
    code: code.value.replaceAll(' ', ''),
    uuid: store.client.uuid,
  })

  if (error) {
    notify({
      title: 'Неверный код',
    })
  } else {
    await store.getClient()
    return navigateTo('/partner', { external: true })
  }
}

async function deleteToken(uuid: string) {
  const { data, error }: any = await useFetch('/api/token/deleteToken', {
    method: 'GET',
    params: {
      uuid,
    },
  })
}

async function reloginCycle() {
  const { data, error }: any = await useFetch('/api/token/reLoginCycle', {
    method: 'GET',
  })
  if (data.value) {
    if (data.value.status == 'logined') {
      return 'logined'
    } else {
      return 'ol'
    }
  }
}

async function logout() {

  await signOut({
    callbackUrl: '/auth',
  })
}
</script>

<template>
  <div class="hidden title w-full justify-center p-2 xl:flex"></div>
  <div
    class="absolute flex mt-[12%] flex-col justify-center w-full py-10 overflow-hidden"
  >
    <div class="w-full flex justify-center">
      <div
        class="card w-[400px] bg-base-100 shadow-2xl flex flex-col gap-4 justify-center"
      >
        <div class="text-center text-2xl mt-4 ">
          Двухфакторная аутентификация
        </div>
        <div class="divider mx-2 mt-0" />
        <div class="text-center text-lg -mt-5">
          Введите код с приложения Аутентификатор
        </div>
        <div class="flex justify-center flex-wrap gap-3">
          <input
            @keyup.enter="confirm2fa"
            ref="codeInput"
            placeholder="Введите 6-ти значный код"
            v-maska
            data-maska="### ###"
            class="input text-xl input-bordered w-full max-w-xs"
            v-model="code"
          />
          <div class="flex gap-28 mt-4 mb-5 justify-between">
            <button class="btn w-32" @click="logout">Выйти</button>
            <button class="btn btn-primary" @click="confirm2fa">
              Подтвердить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
