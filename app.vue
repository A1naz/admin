<script lang="ts" setup>
import { useMainStore } from '@/stores/main'
const colorMode = useColorMode()

const { status, data } = useSession()

const store = useMainStore()
onMounted(async () => {
  console.log(status.value)
  store.theme = document.documentElement.getAttribute('data-theme') === 'dracula' ? 'dracula' : 'light'

})
if (status.value === 'authenticated') {
  await store.getClient()
}
</script>
<template>
  <div>
    <notifications position="bottom right">
      <template #body="props">
        <div style="padding: 1rem">
          <div class="notif-card">
            <p class="notif-title">
              {{ props.item.title }}
            </p>
            <div class="notif-text" v-html="props.item.text" />
          </div>
        </div>
      </template>
    </notifications>
    <NuxtLayout>
      <NuxtLoadingIndicator :color="colorMode.value === 'light' ? '#570df8' : '#ff79c6'" /> <!-- here -->
      <NuxtPage>
      </NuxtPage>
    </NuxtLayout>

  </div>
</template>
<style lang="css">
@import '~~/assets/style/datepicker.css';

body {
  @apply scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin
}

.notif-text {
  font-size: 0.9rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: gray
}

.notif-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white
}

.notif-card {
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

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .4s linear;
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
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.5rem);
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
