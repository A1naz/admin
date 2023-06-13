import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    client: {} as any,
    theme: 'light',
    pickpoints: [] as any,
    selectedItem: null as number | null,
    drawerOpened: null as boolean | null,
  }),
  // optional actions

  actions: {
    async checkTelegramId(client: any) {
      if (client.telegram && !client.telegramUserId)
        console.log('no telegram id')
    },
    async getClient() {
      const { data } = await useFetch('/api/user/client', {
        headers: useRequestHeaders(['cookie']) as HeadersInit,
      })
      const client = data.value?.client
      this.checkTelegramId(client)
      this.setClient(client as object)
    },

    setClient(client: object) {
      this.client = client
    },
  },
})
