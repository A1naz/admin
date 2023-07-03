<script lang="ts" setup>
const store = useMainStore()
const colorMode = useColorMode()

const theme = ref('light')
const route = useRoute()
const { status, data, signIn, signOut } = useAuth()
const currency = useCurrency()
const pageContent = ref()
const lightMode = ref(colorMode.value === 'dark')
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
const noBreadcrumbs = computed(() => !(route.path === '/profile' || route.path === '/paymenthistory' || route.path === '/reports'))
</script>

<template>
  <div class="drawer lg:drawer-open z-10">
    <input id="my-drawer" type="checkbox" class="drawer-toggle">
    <div class="drawer-content w-full flex flex-col items-center scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin">
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
      <div ref="pageContent" class="px-6 py-2 lg:p-6 max-w-full w-full">
        <div v-if="noBreadcrumbs" class="breadcrumbs p-0 lg:text-sm">
          <ul>
            <li>
              <a href="#">
                <nuxt-img src="/icons/wb.svg" alt="" srcset="" loading="lazy" />
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
    <div class="drawer-side ">
      <label for="my-drawer" class="drawer-overlay" />
      <ul class="menu w-72 h-full bg-base-200 text-base-content flex-nowrap">
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
                    'bg-base-300': route.path === '/profile',
                  }" to="/profile" class="btn btn-sm btn-circle relative"
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
        <h3 class="opacity-60 text-xs p-3 px-8 uppercase">
          Продвижение товаров
        </h3>
        <SidebarItem title="Выкупы" icon="fluent:payment-24-filled" href="/buyouts" />
        <SidebarItem title="Доставки" icon="fluent:box-24-filled" href="/delivery" />
        <SidebarItem title="Отзывы" icon="fluent:comment-24-filled" href="/reviews" />
        <h3 class="opacity-60 text-xs p-3 px-8 uppercase">
          Улучшение репутации
        </h3>
        <SidebarItem title="Лайки на отзывы" icon="fluent:thumb-like-24-filled" href="/likes" />
        <SidebarItem title="Лайки на товар / бренд" icon="fluent:heart-24-filled" href="/productlikes" />
        <SidebarItem title="Вопросы" icon="fluent:chat-bubbles-question-24-filled" href="/questions" />
        <SidebarItem title="Корзина" icon="fluent:cart-24-filled" href="/cart" />
        <SidebarItem title="Автоответчик на отзывы" icon="fluent:phone-chat-24-filled" href="/autoanswer" />

        <h3 class="opacity-60 text-xs p-3 px-8 uppercase">
          Дополнительно
        </h3>
        <SidebarItem icon="fluent:history-24-filled" title="История платежей" href="/paymenthistory" />
        <SidebarItem icon="fluent:document-bullet-list-24-filled" title="Отчеты по выкупам" href="/reports" />

        <div class="mt-auto">
          <div class="w-full  hover:cursor-default p-0 block">
            <div class="join flex justify-between  w-full items-center p-0 m-0">
              <div
                class="join-item btn btn-ghost gap-2 flex justify-center items-center normal-case w-[80%] hover:cursor-pointer rounded-lg p-0 m-0"
                @click="logout"
              >
                <Icon name="fluent:sign-out-24-filled" size="24" />
                <span>
                  Выйти
                </span>
              </div>
              <label class="join-item btn btn-ghost btn-square z-10 w-[20%] swap swap-rotate">

                <!-- this hidden checkbox controls the state -->
                <input v-model="lightMode" type="checkbox" @click="changeTheme">

                <!-- sun icon -->
                <Icon class="swap-on fill-current w-6 h-6" name="fluent:weather-sunny-24-regular" />

                <!-- moon icon -->
                <Icon class="swap-off fill-current w-6 h-6" name="fluent:weather-moon-24-regular" />

              </label>
            </div>
          </div>
        </div>
      </ul>
    </div>
    <PaymentModal />
  </div>
</template>

<style scoped></style>
