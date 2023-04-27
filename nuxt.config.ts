// https://nuxt.com/docs/api/configuration/nuxt-config
const baseUrl = '/'

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
    pageTransition: { name: 'page', mode: 'out-in' },

  },
  colorMode: {
    preference: 'system', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
    classSuffix: '',
  },
  vue: {},
  auth: {
    origin: process.env.PUBLIC_SITE_URL,
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

  nitro: {
    compressPublicAssets: true,
    storage: {
      db: {
        driver: 'mongodb',
        connectionString: process.env.MONGODB_URI,
      },
    },
    devStorage: {
      db: {
        driver: 'mongodb',
        connectionString: process.env.MONGODB_URI,
      },
    },
    plugins: ['~/server/index.ts'],
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image-edge',
    '@pinia/nuxt',
    'nuxt-icon',
    '@sidebase/nuxt-auth',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@bg-dev/nuxt-s3',
    '@nuxtjs/fontaine',
    'nuxt-delay-hydration',
    '@sfxcode/nuxt-primevue',
    '@nuxtjs/robots',
    '@nuxtjs/html-validator',
    'nuxt-purgecss',
    '@morev/vue-transitions/nuxt',
  ],
  css: [
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@vuepic/vue-datepicker/dist/main.css',
    '@sfxcode/formkit-primevue/dist/sass/formkit-prime-inputs.scss',
    '@sfxcode/formkit-primevue/dist/sass/formkit-primevue.scss',
    // 'primevue/resources/themes/tailwind-light/theme.css',
    // 'primevue/resources/themes/soho-dark/theme.css',
  ],
  purgecss: {
    enabled: false, // Always enable purgecss
    safelist: ['collapse'], // Add my-class token to the safelist (e.g. .my-class)
  },
  extends: [
    'nuxt-seo-kit',
  ],
  delayHydration: {
    // enables nuxt-delay-hydration in dev mode for testing
    mode: 'mount',
    debug: process.env.NODE_ENV === 'development',
  },
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
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
      },
    },
  },
  build: {
    transpile: ['nuxt', 'primevue'],
  },
  primevue: {
    components: {
      include: ['DataTable', 'Column'],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    devOptions: {
      enabled: false,
    },
  },
  imports: {
    dirs: ['./stores'],
  },
  runtimeConfig: {
    public: {
      siteName: process.env.NAME,
      BOT_ID: process.env.BOT_ID,
      siteUrl: process.env.PUBLIC_SITE_URL,
      siteDescription: 'Сервис для продвижения Wildberries.',
      language: 'ru',
      trailingSlash: true,
      titleSeparator: '|',
      BOT_LOGIN: process.env.BOT_LOGIN,
    },
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
  },
  security: {
    headers: false,
    xssValidator: false,
  },
})
