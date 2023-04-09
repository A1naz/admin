import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(autoAnimatePlugin)
})
