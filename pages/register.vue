<script lang="ts" setup>

import { useVuelidate } from '@vuelidate/core';
import { required, email, sameAs, minLength, helpers } from '@vuelidate/validators';
definePageMeta({ auth: false })
const { status } = useSession()
const alert = ref(false)
const alertText = ref('')
const alertType = ref('success')
const name = useRuntimeConfig().NAME
const result = ref()
const formData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});
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
      sameAs: helpers.withMessage("Пароли не совпадают", sameAs(formData.password)),
    },
  };
});

const v$ = useVuelidate(rules, formData);

const submitForm = async () => {
  v$.value.$validate();
  console.log('err', v$.value.$error)
  console.log('err', v$.value)
  if (!v$.value.$error) {
    loading.value = true
    const response = await useFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    console.log('response', response)
    result.value = response

    if (response.data.value?.status === 'error') {
      alert.value = true
      alertType.value = 'error'
      alertText.value = response.data.value.error as string
      useTimeoutFn(() => {
        alert.value = false
      }, 3000)

    } else {
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

onMounted(async () => {
  if (status.value === 'authenticated') {
    return navigateTo('/app', { external: true })
  }
})

</script>

<template>
  <section class="">
    <Toast :type="alertType" :active="alert">
      {{ alertText }} </Toast>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <NuxtLink to="/" class="flex items-center mb-6 text-2xl font-semibold ">
        <Icon name="logos:nuxt-icon" size="32"></Icon>
        {{ name }}
      </NuxtLink>
      <div class="card shadow-lg w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0 ">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight  md:text-2xl ">
            Регистрация
          </h1>

          <form class="space-y-4 md:space-y-6 relative" action="#">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium ">Email</label>
              <input type="email" name="email" id="email" v-model="formData.email"
                class="input input-bordered	sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                :class="{
                  'input-error': v$.email.$error
                }" placeholder="name@company.com" required="true" @change="v$.email.$touch">
              <div class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
                v-for="error of v$.email.$errors" :key="error.$uid">
                <div class="error-msg">{{ error.$message }}</div>
              </div>
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium ">Пароль</label>
              <input type="password" name="password" id="password" placeholder="••••••••" v-model="formData.password"
                class="input input-bordered	sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                :class="{
                  'input-error': v$.password.$error
                }" required="true" @change="v$.password.$touch">
              <div class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
                v-for="error of v$.password.$errors" :key="error.$uid">
                <div class="error-msg">{{ error.$message }}</div>
              </div>
            </div>
            <div>
              <label for="confirm-password" class="block mb-2 text-sm font-medium ">Пароль
                еще раз</label>
              <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••"
                v-model="formData.confirmPassword"
                class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                :class="{
                  'input-error': v$.confirmPassword.$error
                }" required="true" @change="v$.confirmPassword.$touch">
              <div class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
                v-for="error of v$.confirmPassword.$errors" :key="error.$uid">
                <div class="error-msg">{{ error.$message }}</div>
              </div>
            </div>

            <button type="submit" @click.prevent="submitForm" :class="{
              'loading': loading,
            }"
              class="btn btn-block btn-primary  bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-6">Зарегистироваться</button>
            <p class="text-sm font-light ">
              Уже есть аккаунт? <NuxtLink to="/auth"
                class="font-medium text-primary-600 hover:underline dark:text-primary-500">Войдите здесь</NuxtLink>
            </p>
            <div class="divider">Или</div>

            <TelegramLoginButton mode="callback" telegram-login="topvtop_authbot" size="medium" class="rounded-lg m-auto"
              userpic="false" />
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
