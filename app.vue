<script lang="ts" setup>
import { useNotification } from '@kyvg/vue3-notification'
import { SwipeDirection } from '@vueuse/core'
import { useMainStore } from '@/stores/main'

const { notify } = useNotification()
const colorMode = useColorMode()

const { status, data } = useAuth()

const store = useMainStore()
const { pending, data: client, error, refresh } = useLazyAsyncData('client', () => $fetch('/api/user/client'))
useIntervalFn(() => {
  refresh()
}, 1000 * 60)
if (status.value === 'authenticated')
  await store.getClient()

const app = ref()

const { isSwiping, direction, coordsStart } = useSwipe(app, {
  threshold: 50,
})

watch(isSwiping, (val) => {
  if (!val)
    return
  if (direction.value === SwipeDirection.RIGHT && coordsStart.x < app.value.offsetWidth / 2)
    store.drawerOpened = true
})
watch(client, (newClient) => {
  store.setClient(newClient?.client as object)
})
</script>

<template>
  <div ref="app">
    <notifications position="bottom right">
      <template #body="props">
        <div style="padding: 1rem">
          <div class="notify-card">
            <p class="notify-title">
              {{ props.item.title }}
            </p>
            <div class="notify-text" v-html="props.item.text" />
          </div>
        </div>
      </template>
    </notifications>
    <NuxtLayout>
      <NuxtLoadingIndicator :color="colorMode.value === 'light' ? '#570df8' : '#ff79c6'" />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="css">
@import '~~/assets/style/datepicker.css';

body {
  @apply scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin
}

.notify-text {
  font-size: 0.9rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: gray
}

.notify-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white
}

.notify-card {
  padding: 1rem;
  background-color: #121212;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  width: 300px;
  max-width: 100%;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s linear;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: transform 0.4s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.4s linear;
}

.pop-enter,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(-50%);
}

.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.1rem);
}

.heading {
  @apply text-xl font-bold mt-1
}

.title {
  @apply text-2xl font-bold mt-1
}

.description {
  @apply text-sm text-gray-500 font-light mt-1
}
</style>
