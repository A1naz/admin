<script lang="ts" setup>
const store = useMainStore()
const colorMode = useColorMode()

const theme = ref('light')
const route = useRoute()
const themes = ['cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter']
const numberFormat = new Intl.NumberFormat()
const { status, data, signIn, signOut } = useAuth()
const currency = useCurrency()
const name = useRuntimeConfig().NAME
const currentPath = ref(useRoute().path)
const clicks = ref(0)
const timer: NodeJS.Timeout | null = null
function changeTheme() {
  if (colorMode.value === 'light')
    colorMode.preference = 'dark'
  else
    colorMode.preference = 'light'
}

async function logout() {
  await signOut({
    callbackUrl: '/auth',
  })
  store.setClient({})
}
function getBreadcrumbs() {
  const route = useRoute()

  const pathArray = route.path.split('/')
  pathArray.shift()
  const breadcrumbs = pathArray.reduce((breadcrumbArray: any, path: string, idx: number) => {
    const currPath = breadcrumbArray[idx - 1]
      ? `${breadcrumbArray[idx - 1].to}/${path}`
      : `/${path}`
    breadcrumbArray.push({
      to: breadcrumbArray[idx - 1]
        ? `${breadcrumbArray[idx - 1].to}/${path}`
        : `/${path}`,
      title: useRouter().resolve(currPath).meta.title,
    })
    return breadcrumbArray
  }, [])
  return breadcrumbs
}

onMounted(() => {
  theme.value = localStorage.getItem('theme') || 'light'
})
const breadcrumbs = computed(() => getBreadcrumbs())
</script>

<template>
  <div class="drawer drawer-mobile">
    <input id="my-drawer" v-model="store.drawerOpened" type="checkbox" class="drawer-toggle lg:">
    <div class="drawer-content scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin">
      <div class="w-full navbar bg-base-100 lg:hidden">
        <div class="flex-none">
          <label for="my-drawer" class="btn btn-square btn-ghost drawer-button">
            <svg
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="inline-block w-6 h-6 stroke-current"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
        </div>
        <div class="flex-1 justify-center mr-12">
          <Logo />
        </div>
      </div>

      <!-- Page content here -->
      <div class="px-6 py-2 lg:p-6 block">
        <div v-if="route.path !== '/profile' && route.path !== '/paymenthistory'" class="breadcrumbs p-0 lg:text-sm">
          <ul>
            <li>
              <a href="#">
                <nuxt-img src="/icons/wb.svg" alt="" srcset="" />
              </a>
            </li>
            <li v-for="(crumb, index) of breadcrumbs" :key="index">
              <NuxtLink :to="crumb.to">
                {{ crumb.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <slot />
      </div>
    </div>
    <div class="drawer-side">
      <label for="my-drawer" class="drawer-overlay rounded-xl lg:m-2" />
      <ul class="menu w-72 bg-base-200 rounded-xl lg:m-2 text-base-content justify-start">
        <!-- Sidebar content here -->
        <div class="hidden title w-full justify-center p-2 lg:flex">
          <Logo />
        </div>
        <div class="card m-4 mx-4 bg-neutral-focus text-neutral-content">
          <div class="card-body gap-4 p-4">
            <div>
              <div class="flex justify-between items-start">
                <div class="">
                  <div class="font-bold">
                    {{ store.client?.username ? store.client.username : store.client.telegram ? store.client.telegram
                      : store.client.email.split('@')[0] }}
                  </div>
                  <div class="balance text-xs text-gray-400">
                    Баланс: {{ currency.format(store.client.balance) }}
                  </div>
                </div>
                <NuxtLink
                  :class="{
                    'bg-neutral-focus': route.path !== '/profile',
                  }" to="/profile" class="btn btn-circle btn-sm hover:bg-neutral"
                >
                  <IconCSS name="fluent:person-24-filled" size="24" />
                </NuxtLink>
              </div>
            </div>
            <div>
              <label for="payment-modal" class="btn btn-block btn-sm btn-neutral hover:bg-neutral">
                Пополнить
              </label>
            </div>
          </div>
        </div>
        <SidebarItem title="Выкупы" icon="fluent:payment-24-filled" href="/buyouts" />
        <SidebarItem title="Доставки" icon="fluent:box-24-filled" href="/delivery" />
        <SidebarItem title="Отзывы" icon="fluent:comment-24-filled" href="/reviews" />
        <SidebarItem title="Лайки на отзывы" icon="fluent:thumb-like-24-filled" href="/likes" />

        <li />
        <SidebarItem icon="fluent:history-24-filled" title="История платежей" href="/paymenthistory" />
        <li class="mt-auto w-full no-animation hover:bg-base-200">
          <div class="w-full no-animation hover:bg-base-200 hover:cursor-default p-0">
            <div class="flex justify-between w-full items-center p-0 m-0">
              <div
                class="btn btn-ghost gap-2 flex justify-center items-center normal-case w-[80%] hover:cursor-pointer rounded-lg p-0 m-0"
                @click="logout"
              >
                <Icon name="fluent:sign-out-24-filled" size="24" />
                <span>
                  Выйти
                </span>
              </div>
              <label class="btn btn-ghost btn-square z-10 w-[20%]" @click="changeTheme">
                <Icon name="fluent:dark-theme-24-filled" size="24" />
              </label>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <PaymentModal />
  </div>
</template>

<style scoped></style>
