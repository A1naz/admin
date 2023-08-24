<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useMainStore } from '~~/stores/main'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator(value: string) {
      return ['callback', 'redirect'].includes(value)
    },
  },
})
const emit = defineEmits(['callback'])
const store = useMainStore()
const { signIn } = useAuth()
const bot_id = useRuntimeConfig().public.BOT_ID
const bot_login = useRuntimeConfig().public.BOT_LOGIN

async function onTelegramAuth(user: any) {
  const { error, url } = await signIn('telegram-login', { ...user, redirect: false })

  if (error) {
    console.log(error)
  }
  else {
    // No error, continue with the sign in, e.g., by following the returned redirect:
    store.getClient()
    return navigateTo('/buyouts', { external: true })
  }
}
const telegram = ref()

function login() {
  const telegramLogin = bot_login
  // @ts-expect-error window global var
  window.Telegram.Login.auth(
    { bot_id, request_access: true },
    (data: any) => {
      if (!data) {
        // user cancelled login
        return
      }
      onTelegramAuth(data)
    },
  )
}
onMounted(() => {
  // create script with given params
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js'

  // script.setAttribute('data-size', props.size);
  script.setAttribute('async', 'true')
  // script.setAttribute('data-userpic', props.userpic);
  // script.setAttribute('data-telegram-login', props.telegramLogin);
  // script.setAttribute('data-request-access', props.requestAccess);
  // if (props.radius) {
  //   script.setAttribute('data-radius', props.radius);
  // }

  if (props.mode === 'callback') {
    // @ts-expect-error workaround
    window.onTelegramAuth = onTelegramAuth
    script.setAttribute('data-onauth', 'window.onTelegramAuth(user)')
  }
  else {
    // script.setAttribute('data-auth-url', props.redirectUrl);
  }
  telegram.value.appendChild(script)
})
</script>

<template>
  <div ref="telegram" class="w-full flex justify-center">
    <label class="btn btn-lg gap-2 btn-outline normal-case font-medium btn-block border-blue-500 text-blue-500" @click="login">
      <Icon size="24" name="logos:telegram" />
      Войти через Telegram
    </label>
  </div>
</template>

<style></style>
