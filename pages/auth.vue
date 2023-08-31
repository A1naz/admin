<!-- eslint-disable @typescript-eslint/no-use-before-define -->
<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required } from '@vuelidate/validators'

const store = useMainStore()

definePageMeta({
  colorMode: 'dark',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/buyouts',
  },
  title: 'Вход',
})

const router = useRouter()
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
  // if (v$.value.$error)
  //   return

  loading.value = true
  const { error, url } = await signIn('credentials', { redirect: false, callbackUrl: '/buyouts', ...formData })
  if (error) {
    alertType.value = 'error'
    if (error === 'Email is not confirmed') {
      alertText.value = 'Подтвердите email для входа'
      alertType.value = 'warning'
    }
    else {
      alertText.value = 'Неверный email или пароль'
    }
    alert.value = true
    setTimeout(() => {
      alert.value = false
    }, 3000)
  }
  else {
    store.getClient()
    return router.push('/buyouts')
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
      minLength: helpers.withMessage('Пароль должен быть длиннее 6 символов', minLength(6)),
    },
  }
})

const v$ = useVuelidate(rules, formData)
</script>

<template>
  <div id="auth">
    <Toast :type="alertType" style="z-index: 1000;" :active="alert">
      {{ alertText }}
    </Toast>

    <section class="left">
      <h3>Войдите в аккаунт</h3>

      <div class="box">
        <form>
          <label>Email <span>*</span></label>
          <input
            id="email" v-model="formData.email" type="email" name="email" placeholder="Введите свой email" :class="{
              'input-error': v$.email.$error,
            }" required="true"
          >

          <label>Пароль <span>*</span></label>
          <input
            id="password" v-model="formData.password" type="password" name="password" placeholder="••••••••" :class="{
              'input-error': v$.password.$error,
            }" required="true"
          >

          <NuxtLink href="/resetPassword">
            Забыли пароль?
          </NuxtLink>
          <button
            type="submit" class="btn btn-primary w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            @click.prevent="login"
          >
            <span v-show="loading" class="loading loading-spinner" />

            Войти
          </button>

          <p>
            Ещё не зарегистрированы? <NuxtLink href="/register">
              Регистрация
            </NuxtLink>
          </p>
        </form>

        <div class="line">
          <div />
          <p>Или</p>
          <div />
        </div>
        <TelegramLoginButton mode="callback" />

        <p class="text">
          *Регистрируясь вы принимаете <a href="">Пользовательское соглашение</a>, <br>
          и подтверждаете, что ознакомлены с <a href="">Политикой конфиденциальности</a>.
        </p>
      </div>
    </section>

    <section class="right">
      <div class="box">
        <div class="logo">
          wb
        </div>

        <h1>Самовыкупы на <br> WildBerries</h1>
        <h2>
          <span>[</span> комплексное продвижение <br>
          - попробовать бесплатно <span>]</span>
        </h2>
      </div>

      <img class="phone" src="~/assets/phone.png" alt="">

      <img class="figure1" src="~/assets/figure1.svg" alt="">
      <img class="figure2" src="~/assets/figure2.svg" alt="">
      <img class="figure3" src="~/assets/figure3.svg" alt="">
      <img class="line" src="~/assets/line.svg" alt="">
    </section>
  </div>
</template>

<style scoped>
@import url('~/assets/style/preview.css');
</style>
