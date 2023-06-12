<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required, sameAs } from '@vuelidate/validators'

definePageMeta({ auth: false, title: 'Смена пароля' })
const name = useRuntimeConfig().NAME

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})
const alert = reactive({
  show: false,
  message: '',
  type: 'success',
})
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
  const { error } = await useFetch('/api/user/changePassword/send', {
    method: 'POST',
    body: formData,
  })

  if (error.value) {
    alert.show = true
    alert.type = 'error'
    alert.message = error.value.message
    useTimeoutFn(() => {
      alert.show = false
    }, 3000)
  }
  else {
    alert.show = true
    alert.type = 'success'
    alert.message = 'Письмо для смены пароля отправлено'
    useTimeoutFn(() => {
      alert.show = false
    }, 3000)
  }
}
</script>

<template>
  <section>
    <Toast :type="alert.type" :active="alert.show">
      {{ alert.message }}
    </Toast>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <NuxtLink to="/" class="flex items-center text-2xl font-semibold ">
        <Logo />
      </NuxtLink>
      <div class="card w-full p-6 rounded-lg shadow-lg  md:mt-0 sm:max-w-md sm:p-8">
        <h2 class="mb-1 text-xl font-bold leading-tight tracking-tight  md:text-2xl ">
          Смена пароля
        </h2>
        <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5 relative" action="#">
          <div>
            <label for="email" class="block mb-2 text-sm font-medium  ">Email</label>
            <input
              id="email" v-model="formData.email" type="email" name="email"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.email.$error,
              }" placeholder="name@company.com"
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
            <label for="password" class="block mb-2 text-sm font-medium  ">Новый пароль</label>
            <input
              id="password" v-model="formData.password" type="password" name="password"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.password.$error,
              }" placeholder="••••••••"
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
            <label for="confirm-password" class="block mb-2 text-sm font-medium  ">Подтвердите пароль</label>
            <input
              id="confirm-password" v-model="formData.confirmPassword"
              type="password"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" :class="{
                'input-error': v$.confirmPassword.$error,
              }" name="confirm-password" placeholder="••••••••"
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
          <button type="submit" class="btn btn-primary block w-full" @click.prevent="submitForm">
            Сменить пароль
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
