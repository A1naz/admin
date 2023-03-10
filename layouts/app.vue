<script lang="ts" setup>
import { themeChange } from 'theme-change'
const store = useMainStore();

const theme = ref('light')
const route = useRoute()
const themes = ["cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"]
onMounted(() => {
  console.log(route.meta)
  theme.value = localStorage.getItem('theme') || 'light'
  console.log(theme.value)
})
const { status, data, signIn, signOut } = useSession()
const name = useRuntimeConfig().NAME
const currentPath = ref(useRoute().path)
const clicks = ref(0)
let timer: NodeJS.Timeout | null = null
const changeTheme = () => {
  clicks.value++
  if (timer !== null) {
    clearTimeout(timer)
  } else {
    timer = setTimeout(() => {
      clicks.value = 0
      timer = null
    }, 3000)
  }
  if (clicks.value === 10) {
    alert('Ты слишком много кликаешь, давай без фанатизма')
    const picked = themes[Math.floor(Math.random() * themes.length)]
    theme.value = picked
    localStorage.setItem('theme', picked)
    document.documentElement.setAttribute('data-theme', picked)
    clicks.value = 0
    return
  }
  if (theme.value === 'light') {
    theme.value = 'dark'
    localStorage.setItem('theme', 'dark')
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    theme.value = 'light'
    localStorage.setItem('theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')

  }
}

const logout = async () => {
  await signOut()
  store.setClient({})
}




</script>
<template>
  <div class="drawer drawer-mobile">
    <input id="my-drawer" type="checkbox" class="drawer-toggle lg:" />

    <div class="drawer-content">
      <div class="w-full navbar bg-base-100 lg:hidden">
        <div class="flex-none">
          <label for="my-drawer" class="btn btn-square btn-ghost drawer-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="inline-block w-6 h-6 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        </div>
        <div class="flex-1 justify-center mr-12">{{ name }}</div>
      </div>

      <!-- Page content here -->
      <div class="px-6 py-2 lg:p-6 block">
        <div v-if="route.path != '/profile'" class="breadcrumbs p-0 lg:text-sm">
          <ul>
            <li>
              <a>
                <img src="/icons/wb.svg" alt="" srcset="">
              </a>
            </li>
            <li v-for="crumb of route.meta.breadcrumb">
              <a>
                {{ crumb }}
              </a>
            </li>
          </ul>
        </div>
        <slot />

      </div>

    </div>
    <div class="drawer-side">
      <label for="my-drawer" class="drawer-overlay"></label>
      <ul class="menu w-72 bg-base-200 rounded-xl lg:m-2 text-base-content justify-start">
        <!-- Sidebar content here -->
        <div class="hidden title w-full justify-center p-2 lg:flex">
          <h1 class="card-title text-center">{{ name }}</h1>

        </div>
        <div class="card m-4 mx-4 bg-[#121212] text-neutral-content">
          <div class="card-body p-4">
            <div class="flex justify-between items-center">
              <div class="text-sm">
                {{ store.client?.username ? store.client.username : data?.user?.email }}
                <button></button>

              </div>
              <NuxtLink to="/profile" class="btn btn-square btn-sm btn-ghost">
                <IconCSS name="material-symbols:account-box" size="24" />
              </NuxtLink>

            </div>


          </div>

        </div>
        <SidebarItem title="Выкупы" icon="material-symbols:credit-card" href="/buyouts"></SidebarItem>
        <SidebarItem title="Доставки" icon="mdi:truck-delivery" href="/delivery"></SidebarItem>
        <li>
        </li>
        <li class="mt-auto w-full no-animation hover:bg-base-200">

          <div class="w-full no-animation hover:bg-base-200 hover:cursor-default p-0">
            <div class="flex justify-between w-full items-center p-0 m-0">
              <div
                class="btn btn-ghost gap-2 flex justify-center items-center normal-case w-[80%] hover:cursor-pointer rounded-lg p-0 m-0"
                @click="logout">
                <Icon name="material-symbols:logout" size="24"></Icon>
                <span>
                  Выйти
                </span>
              </div>
              <label @click="changeTheme" class="btn btn-ghost btn-square z-10 w-[20%]">
                <Icon name="mdi:theme-light-dark" size="24"></Icon>
              </label>
            </div>

          </div>

        </li>

      </ul>

    </div>
  </div>
</template>

<style scoped></style>
