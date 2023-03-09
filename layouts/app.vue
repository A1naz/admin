<script lang="ts" setup>
import { themeChange } from 'theme-change'
const store = useMainStore();

const theme = ref('light')
const route = useRoute()

onMounted(() => {
  console.log(route.meta)
  theme.value = localStorage.getItem('theme') || 'light'
  theme.value === 'light' ? document.documentElement.setAttribute('data-theme', 'light') : document.documentElement.setAttribute('data-theme', 'dark')
})
const { status, data, signIn, signOut } = useSession()
const name = useRuntimeConfig().NAME
const currentPath = ref(useRoute().path)

const changeTheme = () => {
  if (theme.value === 'light') {
    theme.value = 'dark'
    localStorage.setItem('theme', 'dark')
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    theme.value = 'light'
    localStorage.setItem('theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')

  }
  themeChange()

}

const logout = async () => {
  await signOut()
  store.setClient({})
}

watch(() => route.path, () => {
  currentPath.value = route.path
}, { immediate: true });


</script>
<template>
  <div class="drawer drawer-mobile">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content flex flex-col items-center">
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
      <div class="p-4 absolute l-0 self-start">
        <div class="text-sm breadcrumbs">
          <ul>
            <li>
              <a>
                <img src="/icons/wb.svg" alt="" srcset="">
              </a>
            </li>
            <li>
              <a>
                {{ route.meta.name }}
              </a>
            </li>
          </ul>
        </div>
        <slot />

      </div>

    </div>
    <div class="drawer-side">
      <label for="my-drawer" class="drawer-overlay"></label>
      <ul class="menu w-80 bg-base-200 rounded-xl m-2 text-base-content justify-start">
        <!-- Sidebar content here -->
        <div class="hidden title w-full justify-center p-2 lg:flex">
          <h1 class="card-title text-center">{{ name }}</h1>

        </div>
        <div class="card m-4 mx-4 bg-neutral-focus text-neutral-content">
          <div class="card-body items-center text-center">
            <div>
              Привет {{ store.client?.username || data?.user?.email }}!
            </div>
            <div v-if="store.client.userpic" class="avatar">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="store.client.userpic" />
              </div>
            </div>
          </div>

        </div>
        <li :class="{ 'bordered': currentPath == '/buyouts' }">
          <NuxtLink to="/buyouts">
            <Icon name="material-symbols:credit-card" size="24"></Icon><span>Выкупы</span>
          </NuxtLink>
        </li>
        <li :class="{ 'bordered': currentPath == '/delivery' }">
          <NuxtLink to="/delivery">
            <Icon name="mdi:truck-delivery" size="24"></Icon><span>Доставки</span>
          </NuxtLink>
        </li>
        <li>
        </li>
        <li class="mt-auto w-full no-animation hover:bg-base-200">

          <a class="w-full no-animation hover:bg-base-200 hover:cursor-default p-0">
            <div class="flex justify-between w-full items-center p-0 m-0">
              <div
                class="btn btn-ghost flex justify-center items-center normal-case w-[80%] hover:cursor-pointer rounded-lg p-0 m-0"
                @click="logout">
                <Icon name="material-symbols:logout" size="24"></Icon>
                <span>
                  Выйти
                </span>
              </div>
              <label @click="changeTheme" class="btn btn-ghost btn-square z-10 w-[20%]" data-toggle-theme="dark,light"
                data-act-class="toggled">
                <Icon name="mdi:theme-light-dark" size="24"></Icon>
              </label>
            </div>

          </a>

        </li>

      </ul>

    </div>
  </div>
</template>

<style scoped></style>
