// plugins/yandex-map.client.js

import plugin from 'vue-yandex-maps'
import { defineNuxtPlugin } from 'nuxt/app'

const settings = {
  apiKey: '42f2d2d0-5650-479c-aca7-52277719fb42', // Индивидуальный ключ API
  lang: 'ru_RU', // Используемый язык
  coordorder: 'latlong', // Порядок задания географических координат
  debug: false, // Режим отладки
  version: '2.1', // Версия Я.Карт
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(plugin, settings)
})
