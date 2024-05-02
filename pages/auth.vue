<!-- eslint-disable @typescript-eslint/no-use-before-define -->
<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required } from '@vuelidate/validators'
import { useMainStore } from '~~/stores/main'

const store = useMainStore()

definePageMeta({ auth: false, title: 'Авторизация' })

const { status, data, signIn, signOut } = useAuth()
const name = useRuntimeConfig().public.NAME
const alert = ref(false)
const alertText = ref('')
const alertType = ref('success')
const loading = ref(false)
const formData = reactive({
  email: '',
  password: '',
})

async function login() {
  v$.value.$validate()
  if (v$.value.$error) return
  loading.value = true
  const { error, url } = await signIn('credentials', {
    redirect: false,
    callbackUrl: '/partner',
    ...formData,
  })
  if (error) {
    alertType.value = 'error'
    if (error === 'Email is not confirmed') {
      alertText.value = 'Подтвердите email для входа'
      alertType.value = 'warning'
    } else {
      console.log(error)
      alertText.value = 'Неверный email или пароль'
    }
    alert.value = true
    setTimeout(() => {
      alert.value = false
    }, 3000)
  } else {
    // No error, continue with the sign in, e.g., by following the returned redirect:
    store.getClient()
    return navigateTo(url, { external: true })
  }
  loading.value = false
}
onMounted(async () => {
  const params = useRoute().query
  if (params?.emailConfirmed) {
    alertText.value = 'Email успешно подтвержден!'
    setTimeout(() => {
      alert.value = true
    }, 0)
    setTimeout(() => {
      alert.value = false
    }, 3000)
  }
  if (params?.passwordChanged) {
    alertText.value = 'Пароль успешно изменен!'
    setTimeout(() => {
      alert.value = true
    }, 0)
    setTimeout(() => {
      alert.value = false
    }, 3000)
  }
})

const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('Введите email или логин', required),
      email: helpers.withMessage('Введите корректный email', email),
    },
    password: {
      required: helpers.withMessage('Введите пароль', required),
      minLength: helpers.withMessage(
        'Пароль должен быть длиннее 6 символов',
        minLength(6)
      ),
    },
  }
})

const v$ = useVuelidate(rules, formData)
</script>

<template>
  <section class="">
    <Toast :type="alertType" :active="alert">
      {{ alertText }}
    </Toast>
    <div
      class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
    >
      <NuxtLink to="/" class="flex items-center text-2xl font-semibold">
        <!-- <Logo /> -->
      </NuxtLink>
      <div class="card w-full rounded-lg shadow-lg md:mt-0 sm:max-w-md xl:p-0">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1
            class="text-xl font-bold leading-tight tracking-tight md:text-2xl"
          >
            Войдите в аккаунт
          </h1>
          <form class="space-y-4 md:space-y-6" action="#">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium"
                >Email</label
              >
              <input
                id="email"
                v-model="formData.email"
                type="email"
                name="email"
                class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                :class="{
                  'input-error': v$.email.$error,
                }"
                placeholder="name@company.com"
                required="true"
              />
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium"
                >Пароль</label
              >
              <input
                id="password"
                v-model="formData.password"
                type="password"
                name="password"
                placeholder="••••••••"
                class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                :class="{
                  'input-error': v$.password.$error,
                }"
                required="true"
              />
            </div>
            <!-- <div class="flex items-center justify-between">
              <NuxtLink to="/resetPassword" class="link link-hover text-sm font-medium  hover:underline ">
                Забыли
                пароль?
              </NuxtLink>
            </div> -->
            <button
              type="submit"
              class="btn btn-primary w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              @click.prevent="login"
            >
              <span v-show="loading" class="loading loading-spinner" />

              Войти
            </button>

            <!-- <p class="text-sm font-light  ">
              Еще не зарегистрированы? <NuxtLink to="/register" class="font-medium hover:underline dark:text-primary-500">
                Сделайте это тут
              </NuxtLink>
            </p> -->
            <!-- <div class="divider">
              Или
            </div>

            <TelegramLoginButton mode="callback" class="rounded-lg m-auto" /> -->
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
