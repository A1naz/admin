<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useMainStore } from '~~/stores/main';
const store = useMainStore();
const { signIn } = useSession();
const bot_id = useRuntimeConfig().BOT_ID
const bot_login = useRuntimeConfig().BOT_LOGIN

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator(value: string) {
      return ['callback', 'redirect'].includes(value);
    },
  },
});
const emit = defineEmits(['callback']);
const onTelegramAuth = async (user: any) => {
  console.log('user-----', user);
  const { error, url } = await signIn('telegram-login', { ...user, redirect: false })

  if (error) {
    console.log(error)
  } else {
    // No error, continue with the sign in, e.g., by following the returned redirect:
    console.log('authed', url)
    store.getClient()
    return navigateTo('/buyouts', { external: true })
  }
};
const telegram = ref();

const login = () => {
  const telegramLogin = bot_login
  console.log('telegramLogin', telegramLogin)
  // @ts-ignore
  window.Telegram.Login.auth(
    { bot_id, request_access: true },
    (data: any) => {
      if (!data) {
        // user cancelled login
        return;
      }
      onTelegramAuth(data);
    }
  );
}
onMounted(() => {
  // create script with given params
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://telegram.org/js/telegram-widget.js';

  // script.setAttribute('data-size', props.size);
  script.setAttribute('async', 'true')
  // script.setAttribute('data-userpic', props.userpic);
  // script.setAttribute('data-telegram-login', props.telegramLogin);
  // script.setAttribute('data-request-access', props.requestAccess);
  // if (props.radius) {
  //   script.setAttribute('data-radius', props.radius);
  // }

  if (props.mode === 'callback') {
    // @ts-expect-error
    window.onTelegramAuth = onTelegramAuth;
    script.setAttribute('data-onauth', 'window.onTelegramAuth(user)');
  } else {
    // script.setAttribute('data-auth-url', props.redirectUrl);
  }
  telegram.value.appendChild(script);
});


</script>
<template>
  <div class="w-full flex justify-center" ref="telegram">
    <label @click="login" class="btn gap-2 btn-outline normal-case font-medium btn-block border-blue-500 text-blue-500">
      <Icon size="24" name="logos:telegram" />
      Войти через Telegram
    </label>
  </div>
</template>

<style></style>