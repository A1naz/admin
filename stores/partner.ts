import { defineStore } from 'pinia'

export const usePartnerStore = defineStore('partner', () => {
  const quantity = ref(0)

  async function getNotificationQuantity() {
    const { data, error }: any = await useFetch(
      '/api/partner/withdrawNoficationCount',
      {
        method: 'GET',
      }
    )

    if (error.value) {
      return
    }

    if (data.value) {
      quantity.value = data.value.quantity
      
    }
  }

  return {
    quantity,
    getNotificationQuantity,
  }
})
