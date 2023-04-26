<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required, sameAs } from '@vuelidate/validators'

definePageMeta({ auth: false })
const { status } = useAuth()
const alert = ref(false)
const alertText = ref('')
const alertType = ref('success')
const result = ref()
const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})
const loading = ref(false)
const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('Введите email', required),
      email: helpers.withMessage('Введите корректный email', email),
    },
    password: {
      required: helpers.withMessage('Введите пароль', required),
      minLength: helpers.withMessage('Пароль должен быть длиннее 6 символов', minLength(6)),
    },
    confirmPassword: {
      required: helpers.withMessage('Подтвердите пароль', required),
      sameAs: helpers.withMessage('Пароли не совпадают', sameAs(formData.password)),
    },
  }
})

const v$ = useVuelidate(rules, formData)

async function submitForm() {
  v$.value.$validate()

  if (!v$.value.$error) {
    loading.value = true
    const { pending, data } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    result.value = data
    loading.value = false
    if (data.value!.status === 'error') {
      alert.value = true
      alertType.value = 'error'
      alertText.value = data.value!.error as string
      useTimeoutFn(() => {
        alert.value = false
      }, 3000)
    }
    else {
      alert.value = true
      alertType.value = 'success'
      alertText.value = 'Пользователь зарегистрирован. Проверьте почту для подтверждения'
      useTimeoutFn(() => {
        alert.value = false
      }, 3000)
    }
    loading.value = false
  }
}
</script>

<template>
  <section class="">
    <Toast :type="alertType" :active="alert">
      {{ alertText }}
    </Toast>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <NuxtLink to="/" class="flex items-center text-2xl font-semibold ">
        <Logo />
      </NuxtLink>
      <div class="card shadow-lg w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0 ">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight  md:text-2xl ">
            Регистрация
          </h1>

          <form class="space-y-4 md:space-y-6 relative" action="#">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium ">Email</label>
              <input
                id="email" v-model="formData.email" type="email" name="email"
                class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                :class="{
                  'input-error': v$.email.$error,
                }" placeholder="name@company.com" required="true" @change="v$.email.$touch"
              >
              <div
                v-for="error of v$.email.$errors"
                :key="error.$uid" class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
              >
                <div class="error-msg">
                  {{ error.$message }}
                </div>
              </div>
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium ">Пароль</label>
              <input
                id="password" v-model="formData.password" type="password" name="password" placeholder="••••••••"
                class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                :class="{
                  'input-error': v$.password.$error,
                }" required="true" @change="v$.password.$touch"
              >
              <div
                v-for="error of v$.password.$errors"
                :key="error.$uid" class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
              >
                <div class="error-msg">
                  {{ error.$message }}
                </div>
              </div>
            </div>
            <div class="pb-4">
              <label for="confirm-password" class="block mb-2 text-sm font-medium ">Пароль
                еще раз</label>
              <input
                id="confirm-password" v-model="formData.confirmPassword" type="password" name="confirm-password"
                placeholder="••••••••"
                class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                :class="{
                  'input-error': v$.confirmPassword.$error,
                }" required="true" @change="v$.confirmPassword.$touch"
              >
              <div
                v-if="v$.confirmPassword.$errors"
                class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
              >
                <div class="error-msg">
                  {{ v$.confirmPassword?.$errors[0]?.$message }}
                </div>
              </div>
            </div>

            <button
              type="submit" :class="{
                loading,
              }" class="btn btn-block btn-primary  bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-10"
              @click.prevent="submitForm"
            >
              Зарегистрироваться
            </button>
            <p class="text-sm font-light ">
              Уже есть аккаунт? <NuxtLink
                to="/auth"
                class="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >
                Войдите здесь
              </NuxtLink>
            </p>
            <div class="divider">
              Или
            </div>

            <TelegramLoginButton mode="callback" class="rounded-lg m-auto" />
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
