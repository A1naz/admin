import { defineNuxtPlugin } from 'nuxt/app'

function inject(w: Window & typeof globalThis, d: Document, u: string) {
  const s = d.createElement('script')
  s.async = true
  s.src = `${u}?${Date.now() / 60000 | 0}`
  // s.type = 'text/partytown'
  w.document.head.appendChild(s)
}
export default defineNuxtPlugin((nuxtApp) => {
  inject(window, document, 'https://cdn-ru.bitrix24.ru/b25122566/crm/site_button/loader_3_bd3spe.js')
})
