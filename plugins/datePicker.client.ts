import VueDatePicker from '@vuepic/vue-datepicker'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueDatePicker', VueDatePicker)
})
