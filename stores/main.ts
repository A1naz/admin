import { defineStore } from "pinia";
// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore("main", {
	// a function that returns a fresh state
	state: () => ({
		client: {} as any,
	}),
	// optional actions

	actions: {
		async getClient() {
			const { data: client } = await useFetch("/api/client", {
				transform: (res) => res.client,
			});
			console.log(client.value);
			this.setClient(client.value as object);
		},

		setClient(client: object) {
			this.client = client;
		},
		reset() {
			// `this` is the store instance
		},
	},
});
