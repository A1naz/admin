import { defineStore } from 'pinia'
// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore('main', {
  // a function that returns a fresh state
  state: () => ({
    client: {} as any,
  }),
  // optional actions

  actions: {
    async getClient() {
      const response = await $fetch('/api/client')
      console.log(response)
      this.setClient(response.client)
    },

    setClient(client: object) {
      this.client = client
    },
    reset() {
      // `this` is the store instance
    },
  },
})
