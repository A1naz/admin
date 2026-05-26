<script lang="ts" setup>
const store = useMainStore()
const colorMode = useColorMode()
const partnerStore = usePartnerStore()

const route = useRoute()
const infoModal = ref(false)
const { signOut } = useAuth()
const lightMode = ref(colorMode.value === 'dark')
const drawerCloseOverlay: any = ref(null)

const hasAccess = (tab: string) =>
  store.client.mainAdmin || store.client.tabs.includes(tab)

function changeTheme() {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}

function closeOverlay() {
  drawerCloseOverlay.value?.click()
}

async function logout() {
  await signOut({ callbackUrl: '/auth' })
  store.setClient({})
}
</script>

<template>
  <div class="drawer lg:drawer-open z-10">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
    <div
      class="drawer-content w-full overflow-auto h-[100vh] px-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin"
    >
      <div class="w-full navbar bg-base-100 lg:hidden">
        <div class="flex-none">
          <label for="my-drawer" class="btn btn-square btn-ghost drawer-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-6 h-6 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
        </div>
        <div class="flex-1 justify-center mr-12">
          <Logo />
        </div>
      </div>

      <!-- Page content here -->
      <slot />
    </div>
    <div class="drawer-side z-30 shadow-sm">
      <label for="my-drawer" ref="drawerCloseOverlay" class="drawer-overlay" />
      <ul
        class="menu h-full bg-base-200 w-80 text-base-content flex-nowrap overflow-auto scrollbar-none"
      >
        <!-- Sidebar content here -->
        <div class="hidden title w-full justify-center p-2 xl:flex">
          <Logo />
        </div>
        <div class="flex flex-col w-full border-opacity-50">
          <div class="divider"></div>
        </div>
        <SidebarItem
          v-if="store.client.mainAdmin"
          title="Пользователи и права"
          icon="mdi:user"
          href="/users"
        />
        <SidebarItem
          v-if="store.client.mainAdmin"
          title="Ручные пополнения средств"
          icon="mdi:account-credit-card"
          href="/manualTransfer"
        />
        <SidebarItem
          v-if="hasAccess('история действий')"
          title="История действий"
          icon="mdi:clipboard-text-clock"
          href="/actionsHistory"
        />
        <SidebarItem
          v-if="hasAccess('история действий пользователей')"
          title="История действий пользователей"
          icon="mdi:clipboard-account"
          href="/usersHistory"
        />
        <SidebarItem
          v-if="hasAccess('возврат и задержка')"
          title="Возврат и задержка"
          icon="vaadin:rotate-left"
          href="/refundAndDelay"
        />
        <SidebarItem
          v-if="hasAccess('финансовые операции')"
          title="Финансовые операции"
          icon="nimbus:stats"
          href="/salesAndStatistics"
        />
        <SidebarItem
          v-if="hasAccess('управление партнеркой')"
          icon="fluent:people-team-24-filled"
          href="/partner"
          :title="`Партнерская программа${partnerStore.quantity > 0 ? ' ' + partnerStore.quantity + '+' : ''}`"
        />
        <SidebarItem
          v-if="hasAccess('управление пользователями платформы')"
          title="Управление пользователями"
          icon="mdi:clipboard-account"
          href="/usersManagement"
        />
        <SidebarItem
          v-if="hasAccess('аналитика')"
          icon="mdi:google-analytics"
          title="Аналитика"
          href="/stats?type=all&period=today"
        />
        <SidebarItem
          v-if="hasAccess('запросы скриншотов')"
          icon="mdi:monitor-screenshot"
          title="Запросы скриншотов"
          href="/screenshots"
        />
        <SidebarItem
          class="hidden"
          v-if="hasAccess('ошибки финансовых операции')"
          icon="mdi:money-off"
          title="Ошибки финансовых операции"
          href="/paymentErrors"
        />
        <SidebarItem
          class="hidden"
          v-if="hasAccess('переводы с аккаунта на аккаунт')"
          icon="mdi:account-credit-card-outline"
          title="Переводы с аккаунта на аккаунт"
          href="/balanceTransfer"
        />
        <SidebarItem
          v-if="hasAccess('управление тарифами')"
          icon="mdi:account-details"
          title="Управление тарифами"
          href="/tariff"
        />
        <SidebarItem
          v-if="hasAccess('возвраты средств клиентам')"
          icon="mdi:credit-card-refund"
          title="Возвраты средств клиентам"
          href="/refunds"
        />
        <SidebarItem
          v-if="hasAccess('товары готовые к выдаче')"
          icon="game-icons:card-pickup"
          title="Товары готовые к выдаче"
          href="/delivery/wildberries"
        />
        <SidebarItem
          v-if="hasAccess('фулфилмент')"
          icon="mdi:courier-fast"
          title="Фулфилмент"
          href="/fulfilment/wildberries"
        />
        <SidebarItem
          v-if="hasAccess('клиенты')"
          icon="solar:users-group-two-rounded-line-duotone"
          title="Клиенты"
          href="/clientsInfo"
        />
        <SidebarItem
          v-if="hasAccess('вывод с баланса')"
          icon="ph:hand-withdraw"
          title="Вывод с баланса"
          href="/balanceWithdraw"
        />
        <SidebarItem
          v-if="hasAccess('ручные уведомления')"
          icon="iconamoon:notification-bold"
          title="Ручные уведомления"
          href="/handleNotifications"
        />
        <SidebarItem
          v-if="hasAccess('статистика')"
          icon="gridicons:stats-up"
          title="Статистика"
          href="/statistics"
        />
        <SidebarItem
          v-if="hasAccess('коды регистраций')"
          icon="tabler:device-mobile-code"
          title="Коды регистраций"
          href="/phoneCodes"
        />
        <SidebarItem
          v-if="hasAccess('рассылка клиентам')"
          icon="icon-park-outline:send-email"
          title="Рассылка клиентам"
          href="/userMails"
        />
        <SidebarItem
          v-if="hasAccess('utm метки')"
          icon="dinkie-icons:page-curl-small-filled"
          title="UTM метки"
          href="/utmTags"
        />
        <SidebarItem
          v-if="hasAccess('попытки входа')"
          icon="mdi:login-variant"
          title="Попытки входа"
          href="/loginAttempts"
        />
        <SidebarItem
          v-if="hasAccess('запросы направлений')"
          icon="mdi:directions-fork"
          title="Запросы направлений"
          href="/serviceRequests"
        />
        <div class="mt-auto">
          <div class="w-full hover:cursor-default p-0 block mt-8">
            <div class="join flex justify-between w-full items-center p-0 m-0">
              <div
                class="join-item btn btn-ghost gap-2 flex justify-center items-center normal-case w-[60%] hover:cursor-pointer rounded-lg p-0 m-0"
                @click="logout"
              >
                <Icon name="fluent:sign-out-24-filled" size="24" />
                <span> Выйти </span>
              </div>
              <label
                class="join-item btn btn-ghost btn-square z-10 w-[20%] swap swap-rotate"
              >
                <!-- this hidden checkbox controls the state -->
                <input
                  v-model="lightMode"
                  type="checkbox"
                  @click="changeTheme"
                />

                <!-- sun icon -->
                <Icon
                  class="swap-on fill-current w-6 h-6"
                  name="fluent:weather-sunny-24-regular"
                />

                <!-- moon icon -->
                <Icon
                  class="swap-off fill-current w-6 h-6"
                  name="fluent:weather-moon-24-regular"
                />
              </label>
            </div>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
