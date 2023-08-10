// https://nuxt.com/docs/api/configuration/nuxt-config

const baseUrl = '/'

const description = 'Сервис для продвижения Wildberries.'
export default defineNuxtConfig({
  app: {
    baseURL: baseUrl,
    head: {
      viewport: 'width=device-width,initial-scale=1',
      title: process.env.NAME,
      link: [{ rel: 'icon', href: '/favicon.svg' }],
      titleTemplate: '%pageTitle %titleSeparator %siteName',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TOPVTOP - сервис продвижения Wildberries' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    },

  },

  colorMode: {
    preference: 'system',
    dataValue: 'theme',
    classSuffix: '',
  },

  auth: {
    origin: process.env.PUBLIC_SITE_URL || 'https://app.topvtop.pro',
    enableGlobalAppMiddleware: true,
    defaultProvider: 'credentials',
  },

  image: {
    domains: [
      'wb.ru',
      'storage.yandexcloud.net',
      'basket-10.wb.ru',
      'basket-1.wb.ru',
      'basket-2.wb.ru',
      'basket-3.wb.ru',
      'basket-4.wb.ru',
      'basket-5.wb.ru',
      'basket-6.wb.ru',
      'basket-7.wb.ru',
    ],
  },

  yandexMetrika: {
    id: '94036055',
  },

  lazyLoad: {
    // These are the default values
    images: true,
    videos: true,
    audios: true,
    iframes: true,
    native: false,
    directiveOnly: false,

    // To remove class set value to false
    loadingClass: 'isLoading',
    loadedClass: 'isLoaded',
    appendClass: 'lazyLoad',

    observerConfig: {
      // See IntersectionObserver documentation
    },
  },

  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: false,
      routes: [],
      ignore: ['/'],
    },
    plugins: ['~/server/index.ts'],
  },

  modules: [
    'nuxt-lazy-load',
    '@nuxtjs/tailwindcss',
    '@nuxt/image-edge',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-icon',
    '@sidebase/nuxt-auth',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxtjs/color-mode',
    '@bg-dev/nuxt-s3',
    '@nuxtjs/fontaine',
    '@sfxcode/nuxt-primevue',
    '@nuxtjs/robots',
    '@morev/vue-transitions/nuxt',
    '@sidebase/nuxt-pdf',
    '@artmizu/yandex-metrika-nuxt',
  ],

  css: [
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@sfxcode/formkit-primevue/dist/sass/formkit-prime-inputs.scss',
    '@sfxcode/formkit-primevue/dist/sass/formkit-primevue.scss',
    '@vuepic/vue-datepicker/dist/main.css',
  ],

  extends: [
    'nuxt-seo-kit',
  ],

  s3: {
    client: {
      credentials: {
        secretAccessKey: 'YCNnWGgkItHnLLEKtqCq4LP-cmCtcMpydXKJnbO5',
        accessKeyId: 'YCAJEdIRUFVg4W949lwNMEivY',
      },
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
    },
    publicBucketUrl: 'https://shifft.storage.yandexcloud.net/',
    bucket: 'shifft',
    image: {
      compression: {
        maxSizeMB: 10,
        maxWidthOrHeight: 4000,
      },
    },
  },

  build: {
    transpile: ['primevue', '@vuepic/vue-datepicker'],
  },

  primevue: {
    components: {
      include: ['DataTable', 'Column'],
    },
  },

  imports: {
    dirs: ['./stores', './data', './server/lib'],
  },

  runtimeConfig: {
    public: {
      siteName: process.env.NAME,
      BOT_ID: process.env.BOT_ID,
      siteUrl: process.env.PUBLIC_SITE_URL,
      siteDescription: description,
      language: 'ru',
      trailingSlash: true,
      titleSeparator: '|',
      BOT_LOGIN: process.env.BOT_LOGIN,
    },
    env: process.env.ENV_WORK,
    indexable: true,
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET: process.env.SECRET,
    smtpHost: process.env.smtpHost,
    smtpPort: process.env.smtpPort,
    smtpUser: process.env.smtpUser,
    smtpPass: process.env.smtpPass,
    privateKey: process.env.privateKey,
    PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
    BOT_TOKEN: process.env.BOT_TOKEN,
    fkSecret1: process.env.fkSecret1,
    fkSecret2: process.env.fkSecret2,
    fkApiKey: process.env.fkApiKey,
    fkID: process.env.fkID,
  },

  security: {
    headers: false,
    xssValidator: false,
  },

  devtools: {
    enabled: true,
  },
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
    typedPages: true,
  },
})
