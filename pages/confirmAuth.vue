<script lang="ts" setup>
definePageMeta({ auth: false, title: 'Подтверждение входа' })
const name = useRuntimeConfig().NAME

const code = ref('')
const alert = reactive({
  show: false,
  message: '',
  type: 'success',
})

async function submitForm() {
  const { error } = await useFetch('/api/user/changePassword/send', {
    method: 'POST',
    body: code.value,
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
          Введите код отправленный вам в Telegram
        </h2>
        <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5 relative" action="#">
          <div>
            <input
              id="code" v-model="code" type="text" name="code"
              pattern="[0-9]{4}"
              class="input input-bordered text-lg font-bold text-center sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="****"
              maxlength="4"
            >
          </div>
          <button type="submit" class="btn btn-primary block w-full" @click.prevent="submitForm">
            Войти
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
