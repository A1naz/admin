<script lang="ts" setup>
definePageMeta({ auth: false })

const { status, data, signIn, signOut } = useSession()
const name = useRuntimeConfig().NAME
const alert = ref(false)
const alertText = ref('')
const alertType = ref('success')
const formData = reactive({
  email: '',
  password: '',
});

const login = async () => {
  const { error, url } = await signIn('credentials', { redirect: false, callbackUrl: '/app', ...formData })
  if (error) {
    alertType.value = 'error'

    alert.value = true
    setTimeout(() => {
      alert.value = false
    }, 3000)
    console.log(error)
  } else {
    // No error, continue with the sign in, e.g., by following the returned redirect:
    return navigateTo(url, { external: true })
  }


}
onMounted(async () => {

  const params = useRoute().query
  console.log(params)
  if (params?.emailConfirmed) {
    alertText.value = 'Email успешно подтвержден!'
    setTimeout(() => {
      alert.value = true
    }, 0)
    setTimeout(() => {
      alert.value = false
    }, 3000)
  }
})
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">

    <Toast :type="alertType" :active="alert"> <svg xmlns="http://www.w3.org/2000/svg"
        class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg> <span>
        {{ alertText }}
      </span> </Toast>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

      <NuxtLink to="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img class="w-8 h-8 mr-2" src="" alt="logo">
        {{ name }}
      </NuxtLink>
      <div
        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Войдите в аккаунт
          </h1>
          <form class="space-y-4 md:space-y-6" action="#">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
              <input type="email" name="email" id="email" v-model="formData.email"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="name@company.com" required="true">
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Пароль</label>
              <input type="password" name="password" id="password" v-model="formData.password" placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required="true">
            </div>
            <div class="flex items-center justify-between">

              <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-gray-400">Забыли
                пароль?</a>
            </div>
            <button @click.prevent="login" type="submit"
              class="btn btn-primary w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Войти</button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Еще не зарегистрированы? <NuxtLink to="/register"
                class="font-medium text-primary-600 hover:underline dark:text-primary-500">Сделайте это тут</NuxtLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
