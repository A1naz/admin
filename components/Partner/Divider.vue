<script setup lang="ts">
import { usePartnerStore } from '@/stores/partner'
const partnerStore = usePartnerStore()
</script>
<template>
  <div>
    <ul class="menu bg-base-200 lg:menu-horizontal rounded-box">
      <li>
        <NuxtLink to="/partner/withdrawsRequires">
          <Icon name="vaadin:money-withdraw" size="24" />
          Запросы выплат
          <span class="badge badge-sm" v-if="partnerStore.quantity"
            >{{ partnerStore.quantity }}+</span
          >
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/partner/withdraws">
          <Icon name="ic:round-request-page" size="24" />
          Выплаты
        </NuxtLink>
      </li>

      <li>
        <NuxtLink to="/partner/management">
          <Icon name="ic:sharp-manage-accounts" size="24" />
          Управление партнерами
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
