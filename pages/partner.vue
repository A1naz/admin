<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})
const currency = useCurrency()

const runtimeConfig = useRuntimeConfig()
const withdrawModal = ref(false)
const paymentHistoryModal = ref(false)
const store = useMainStore()
const client = store.client
const partner = client.partner
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}
const url = runtimeConfig.public.siteUrl

const refUrl = computed(() => `${url}/register?ref=${client.username}`)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-4">
      Партнерская программа
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Приглашайте друзей и получайте бонусы
    </p>
    <div class="card bg-base-200 p-4 mt-6 flex flex-col gap-2">
      <div class="account">
        <div>
          Ваш партнерский счет:
        </div>
        <div class="balance text-xl text-primary font-bold">
          {{ currency.format(store.client.partner.balance) }}
        </div>
      </div>
      <div class="referrals">
        <div>
          Приглашенных пользователей:
        </div>
        <div class="count text-xl text-primary font-bold">
          {{ store.client.partner.refCount }} человек
        </div>
      </div>
      <div class="divider m-0" />
      <div class="buttons flex gap-2">
        <button class="btn btn-sm btn-primary" @click="withdrawModal = true">
          Вывод средств
        </button>
        <button class="btn btn-sm btn-primary" @click="paymentHistoryModal = true">
          История баланса
        </button>
      </div>
    </div>
    <div class="linkcard card bg-base-200 p-4 mt-2 flex flex-col gap-2">
      <div>
        <div>Ваша ссылка для приглашения:</div>
        <div class="bg-base-100 rounded-lg p-2 border border-primary mt-2 flex justify-between gap-2 items-center">
          <span>{{ refUrl }}</span>
          <button class="btn btn-sm" @click="copyToClipboard(refUrl)">
            Скопировать
          </button>
        </div>
      </div>
      <div>
        <div>Вознаграждение партнера:</div>
        <div class="text-lg text-primary font-bold">
          {{ partner.rewardPercent }}%
        </div>
      </div>
    </div>
    <PartnerWithdrawModal v-if="withdrawModal" :state="withdrawModal" @close="withdrawModal = false" />
    <PartnerPaymentHistoryModal v-if="paymentHistoryModal" :state="paymentHistoryModal" @close="paymentHistoryModal = false" />
  </div>
</template>

<style scoped>

</style>
