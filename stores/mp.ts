import { defineStore } from 'pinia'

export const useMPStore = defineStore('mp', {
    state: () => ({
        selectedMP: 'wildberries' as String,
        MPTabs: [
            { title: 'Wildberries', value: 'wildberries' },
            { title: 'Yandex', value: 'ym' },
            { title: 'Ozon', value: 'ozon' },
            { title: 'Avito', value: 'avito' },
            { title: 'Flowwow', value: 'flowwow' },
            { title: 'Суточно', value: 'sutochno' },
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