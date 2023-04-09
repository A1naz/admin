import { defineStore } from 'pinia'
// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore('main', {
  // a function that returns a fresh state
  state: () => ({
    client: {} as any,
    theme: 'light',
    pickpoints: [] as any,
    selectedItem: null as number | null,
    drawerOpened: null as boolean | null,
  }),
  // optional actions

  actions: {
    async getClient() {
      const { data } = await useFetch('/api/user/client', {
        headers: useRequestHeaders(['cookie']) as HeadersInit,
      })
      console.log(data.value)
      const client = data.value?.client
      this.setClient(client as object)
    },

    setClient(client: object) {
      this.client = client
    },
    reset() {
      // `this` is the store instance
    },
  },
})
