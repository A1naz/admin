import * as html2pdf from 'html2pdf.js'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      html2pdf,
    },
  }
})
