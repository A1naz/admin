import YmapPlugin from "vue-yandex-maps";
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(YmapPlugin, {
		apiKey: "42f2d2d0-5650-479c-aca7-52277719fb42",
		lang: "ru_RU",
		coordorder: "latlong",
		enterprise: false,
		version: "2.1",
	});
});
