<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Тарифные планы',
})

const store = useMainStore()

if (!store.client.mainAdmin && !store.client.tabs.includes('тарифные планы')) {
  navigateTo('/partner')
}
//---------------------------------------------------

const adjustTariffModal = ref(false)

const selectedUser = ref<any>({
  username: '',
})

function selectUser(user: any) {
  selectedUser.value = user
  
  adjustTariffModal.value = true
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Тарифные планы</h1>
  <div class="ml-5 mb-2 mt-5">
    <div class="flex justify-between">
      <TariffPlansSelectUserModal @selectUser="selectUser" />
    </div>
  </div>
  <TariffPlansAdjustTariffModal :isModalOpen="adjustTariffModal" />
</template>
<style scoped>
::-webkit-scrollbar {
  height: 4px;
  width: 10px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 2px;
}
</style>
