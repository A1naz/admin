<script lang="ts" setup>
const store = useMainStore()
const colorMode = useColorMode()
const partnerStore = usePartnerStore()

const theme = ref('light')
const route = useRoute()
const infoModal = ref(false)
const { status, data, signIn, signOut } = useAuth()
const currency = useCurrency()
const pageContent = ref()
const lightMode = ref(colorMode.value === 'dark')
function changeTheme() {
  if (colorMode.value === 'light') colorMode.preference = 'dark'
  else colorMode.preference = 'light'
}

async function logout() {
  await signOut({
    callbackUrl: '/auth',
  })
  store.setClient({})
}

onMounted(() => {
  theme.value = localStorage.getItem('theme') || 'light'
})
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
      <label for="my-drawer" class="drawer-overlay" />
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
          title="Пользователи и права"
          icon="mdi:user"
          href="/users"
        />
        <SidebarItem
          title="История действий"
          icon="mdi:clipboard-text-clock"
          href="/actionsHistory"
        />
        <SidebarItem
          title="Финансовые операции"
          icon="nimbus:stats"
          href="/salesAndStatistics"
        />
        <SidebarItem
        :title="`Партнерская программа ${
          partnerStore.quantity > 0 ? partnerStore.quantity + '+' : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        }`"
          icon="fluent:people-team-24-filled"
          href="/partner"
          >
          <template #title> Партнерская программа </template>
        </SidebarItem>
        <SidebarItem
          title="Управление пользователями"
          icon="mdi:clipboard-account"
          href="/usersManagement"
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
