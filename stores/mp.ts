import { defineStore } from 'pinia'

export const useMPStore = defineStore('mp', {
    state: () => ({
        selectedMP: 'wildberries' as String,
        MPTabs: [
            { title: 'Wildberries', value: 'wildberries' },
            { title: 'Ozon', value: 'ozon' },
            { title: 'Avito', value: 'avito' },
            { title: 'Flowwow', value: 'flowwow' },
            { title: 'VK', value: 'vk' },
            { title: 'Ym', value: 'ym' },
          ],
    }),
    persist: {
        storage: persistedState.localStorage,
    },
    actions: {
        setSelectedMP(selectedMP: string) {
            this.selectedMP= selectedMP
        }
    }
})