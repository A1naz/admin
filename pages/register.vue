<script lang="ts" setup>

import { useVuelidate } from '@vuelidate/core';
import { required, email, sameAs, minLength, helpers } from '@vuelidate/validators';
definePageMeta({ auth: false })
const { status } = useSession()

const name = useRuntimeConfig().NAME
const result = ref()
const formData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

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
    const response = await useFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    console.log('response', response)
    result.value = response

  }
}

onMounted(async () => {
  if (status.value === 'authenticated') {
    return navigateTo('/app', { external: true })
  }
})

</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <NuxtLink to="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img class="w-8 h-8 mr-2" src="" alt="logo">
        {{ name }}
      </NuxtLink>
      <div
        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Регистрация
          </h1>

          <form class="space-y-4 md:space-y-6 relative" action="#">
            <p v-if="v$.$errors.length" class="text-center text-sm text-warning absolute right-0">
              {{ v$.$errors[0].$message }}
            </p>
            <div>
              <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
              <input type="email" name="email" id="email" v-model="formData.email"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="name@company.com" required="true" @change="v$.email.$touch">
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Пароль</label>
              <input type="password" name="password" id="password" placeholder="••••••••" v-model="formData.password"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required="true" @change="v$.password.$touch">
            </div>
            <div>
              <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Пароль
                еще раз</label>
              <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••"
                v-model="formData.confirmPassword"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required="true" @change="v$.confirmPassword.$touch">
            </div>

            <button type="submit" @click.prevent="submitForm"
              class="w-full btn btn-primary text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Зарегистироваться</button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Уже есть аккаунт? <NuxtLink to="/auth"
                class="font-medium text-primary-600 hover:underline dark:text-primary-500">Войдите здесь</NuxtLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
