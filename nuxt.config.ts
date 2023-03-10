// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {},
	auth: {
		origin: process.env.PUBLIC_SITE_URL,
		enableGlobalAppMiddleware: true,
		defaultProvider: "credentials",
	},
	nitro: {
		plugins: ["~/server/index.ts"],
	},
	modules: [
		"@nuxtjs/tailwindcss",
		"@nuxt/image-edge",
		"@pinia/nuxt",
		"nuxt-icon",
		"@sidebase/nuxt-auth",
		"@nuxt/devtools",
		"@vueuse/nuxt",
		"nuxt-security",
	],
	imports: {
		dirs: ["./stores"],
	},
	runtimeConfig: {
		public: {
			NAME: process.env.NAME,
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
