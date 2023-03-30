// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: process.env.NAME,
			link: [{ rel: "icon", href: "/favicon.svg" }],
		},
	},
	colorMode: {
		preference: "system", // default theme
		dataValue: "theme", // activate data-theme in <html> tag
		classSuffix: "",
	},
	vue: {},
	auth: {
		origin: process.env.PUBLIC_SITE_URL,
		enableGlobalAppMiddleware: true,
		defaultProvider: "credentials",
	},
	image: {
		domains: [
			"wb.ru",
			"basket-10.wb.ru",
			"basket-1.wb.ru",
			"basket-2.wb.ru",
			"basket-3.wb.ru",
			"basket-4.wb.ru",
			"basket-5.wb.ru",
			"basket-6.wb.ru",
			"basket-7.wb.ru",
		],
	},

	nitro: {
		compressPublicAssets: true,
		storage: {
			db: {
				driver: "mongodb",
				connectionString: process.env.MONGODB_URI,
			},
		},
		devStorage: {
			db: {
				driver: "mongodb",
				connectionString: process.env.MONGODB_URI,
			},
		},
		plugins: ["~/server/index.ts"],
	},
	modules: [
		"@nuxtjs/tailwindcss",
		"@nuxt/image-edge",
		"@pinia/nuxt",
		"nuxt-icon",
		"@sidebase/nuxt-auth",
		"@vueuse/nuxt",
		"nuxt-security",
		"@nuxtjs/color-mode",
		"@vite-pwa/nuxt",
	],
	pwa: {
		registerType: "autoUpdate",
		devOptions: {
			enabled: false,
		},
	},
	imports: {
		dirs: ["./stores"],
	},
	runtimeConfig: {
		public: {
			NAME: process.env.NAME,
			BOT_ID: process.env.BOT_ID,
			BOT_LOGIN: process.env.BOT_LOGIN,
		},
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
	},
});
