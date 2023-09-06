import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    client: {} as any,
    theme: 'light',
    pickpoints: [] as any,
    selectedItem: null as number | null,
    drawerOpened: null as boolean | null,
    infoModal: false,
    infoType: '',
  }),
  // optional actions

  actions: {
    checkTelegramId() {
      if (this.client.telegram && !this.client.telegramUserId)
        return false
      else
        return true
    },
    async getClient() {
      const { data } = await useFetch('/api/user/client', {
        headers: useRequestHeaders(['cookie']) as HeadersInit,
      })
      const client = data.value?.client
      this.setClient(client as object)
    },

    setClient(client: object) {
      this.client = client
    },
  },
})
