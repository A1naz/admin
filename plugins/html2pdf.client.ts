import html2pdf from 'html2pdf.js'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      html2pdf: (element?: any, options?: any) => {
        return html2pdf(element, options)
      },
    },
  }
})
