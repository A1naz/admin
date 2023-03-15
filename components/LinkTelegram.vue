<template>
  <button @click="login" ref="telegram" :disabled="store.client?.telegram" class="btn btn-primary">{{
    store.client?.telegram ?
    'Привязан'
    : 'Привязать' }}</button>
</template>
<script lang="ts" setup>

import { ref, onMounted } from 'vue';
import { useMainStore } from '~~/stores/main';

const bot_id = useRuntimeConfig().BOT_ID
const bot_login = useRuntimeConfig().BOT_LOGIN
const store = useMainStore();
const { signIn } = useSession();
const props = defineProps({
  mode: {
    type: String,
    default: 'callback',
    validator(value: string) {
      return ['callback', 'redirect'].includes(value);
    },
  },
});
const emit = defineEmits(['callback']);
const onTelegramAuth = async (user: any) => {
  console.log('user-----', user);
  const { error, data } = await useFetch('/api/user/linkTelegram', {
    method: 'POST',
    body: JSON.stringify(user),
  })
  if (error.value) {
    console.log(error)
    emit('callback', { status: 'error', error: error.value })
  } else {
    // No error, continue with the sign in, e.g., by following the returned redirect:
    store.client.telegram = user.username
    await store.getClient()
    emit('callback', { status: 'ok', data: data.value })
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
<style></style>