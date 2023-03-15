<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core';
import { required, email, sameAs, minLength, helpers } from '@vuelidate/validators';
definePageMeta({ auth: false })
const name = useRuntimeConfig().NAME

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});
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
      sameAs: helpers.withMessage("Пароли не совпадают", sameAs(formData.password)),
    },
  };
});

const v$ = useVuelidate(rules, formData);

const submitForm = async () => {
  v$.value.$validate()
  const { error, data } = await useFetch('/api/user/changePassword/send', {
    method: 'POST',
    body: JSON.stringify(formData),
  })

  if (error.value) {
    alert.show = true
    alert.type = 'error'
    alert.message = error.value.message
    useTimeoutFn(() => {
      alert.show = false
    }, 3000)
  } else {
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
    <Toast :type="alert.type" :active="alert.show">{{ alert.message }}</Toast>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <NuxtLink to="/" class="flex items-center mb-6 text-2xl font-semibold ">
        <Icon name="logos:nuxt-icon" size="32"></Icon>
        {{ name }}
      </NuxtLink>
      <div class="card w-full p-6 rounded-lg shadow-lg  md:mt-0 sm:max-w-md sm:p-8">
        <h2 class="mb-1 text-xl font-bold leading-tight tracking-tight  md:text-2xl ">
          Смена пароля
        </h2>
        <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5 relative" action="#">
          <div>
            <label for="email" class="block mb-2 text-sm font-medium  ">Email</label>
            <input v-model="formData.email" type="email" name="email" id="email"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.email.$error
              }" placeholder="name@company.com">
            <div class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
              v-for="error of v$.email.$errors" :key="error.$uid">
              <div class="error-msg">{{ error.$message }}</div>
            </div>
          </div>
          <div>
            <label for="password" class="block mb-2 text-sm font-medium  ">Новый пароль</label>
            <input v-model="formData.password" type="password" name="password" id="password"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.password.$error
              }" placeholder="••••••••">
            <div class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
              v-for="error of v$.password.$errors" :key="error.$uid">
              <div class="error-msg">{{ error.$message }}</div>
            </div>
          </div>
          <div class="pb-4">
            <label for="confirm-password" class="block mb-2 text-sm font-medium  ">Подтвердите пароль</label>
            <input v-model="formData.confirmPassword" type="password"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.confirmPassword.$error
              }" name="confirm-password" id="confirm-password" placeholder="••••••••">
            <div v-if="v$.confirmPassword.$errors"
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full">

              <div class="error-msg">{{ v$.confirmPassword?.$errors[0]?.$message }}</div>
            </div>
          </div>
          <button @click.prevent="submitForm" type="submit" class="btn btn-primary block w-full">Сменить пароль</button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
