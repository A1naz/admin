// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {},
	vue: {},
	auth: {
		origin: process.env.PUBLIC_SITE_URL,
		enableGlobalAppMiddleware: true,
		defaultProvider: "credentials",
	},
	nitro: {
		storage: {
			db: {
				driver: "mongodb",
				connectionString: process.env.MONGODB_URI,
				databaseName: "site",
				collectionName: "serverStorage",
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
	],
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
