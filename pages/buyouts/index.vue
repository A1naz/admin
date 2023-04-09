<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Выкупы',
})

const route = useRoute()
const router = useRouter()
const buyouts = ref([]) as any
const modal = ref(false)
const selectedBuyout = ref({})
const selectedIndex = ref(-1)
const store = useMainStore()
const selectedPlace = ref(-1)
function openModal(index: number) {
  selectedIndex.value = index
  selectedPlace.value = buyouts.value.length - index
  selectedBuyout.value = buyouts.value[index]
  modal.value = true
}
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  },
)
const skip = ref(50)
const end = ref(false)
const { data } = await useFetch('/api/buyout/get', {
  method: 'GET',
  query: {
    status: route.query?.status || 'all',
    limit: 50,
  },
  headers: useRequestHeaders(['cookie']) as HeadersInit,
})
function removeBuyout(uuid: string) {
  buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}
function archiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid)
      buyout.status = 'archived'

    return buyout
  })
  if (route.query.status && route.query?.status !== 'archived' && route.query?.status !== 'all')
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}

function unarchiveBuyout(uuid: string) {
  buyouts.value = buyouts.value.map((buyout: any) => {
    if (buyout.uuid === uuid)
      buyout.status = 'active'

    return buyout
  })
  if (route.query.status && route.query?.status !== 'active' && route.query?.status !== 'all')
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}
function selectStatus(e: Event) {
  const target = e.target as HTMLSelectElement
  router.push({
    path: '/buyouts',
    query: {
      status: target.value,
    },
  })
}
onMounted(async () => {
  buyouts.value = data.value
  if (route.query?.uuid) {
    const uuid = route.query?.uuid
    if (buyouts.value) {
      console.log(buyouts.value)
      const index = buyouts.value!.findIndex((buyout: any) => buyout.uuid === uuid)
      console.log(index)
      if (index !== -1) {
        openModal(index)
      }
      else {
        const { data, error } = await useFetch('/api/buyout/getOne', {
          method: 'GET',
          query: {
            uuid,
          },
          headers: useRequestHeaders(['cookie']) as HeadersInit,
        })
        if (error.value)
          console.log(error.value)

        if (data.value) {
          buyouts.value = [data.value, ...buyouts.value]
          openModal(0)
        }
      }
    }
  }
})

watch(targetIsVisible, async (isVisible) => {
  if (isVisible) {
    if (end.value)
      return
    const { data } = await useFetch('/api/buyout/get', {
      method: 'GET',
      query: {
        status: route.query?.status || 'all',
        limit: 50,
        skip: skip.value,
      },
      headers: useRequestHeaders(['cookie']) as HeadersInit,
    })
    if (data.value!.length === 0) {
      end.value = true
      return
    }
    buyouts.value = [...buyouts.value, ...data.value!]
    skip.value += 50
  }
})

watch(route, async (newRoute) => {
  skip.value = 50
  end.value = false
  console.log(newRoute)
  const { data } = await useFetch('/api/buyout/get', {
    method: 'GET',
    query: {
      status: newRoute?.query?.status || 'all',
      limit: 50,
    },
    headers: useRequestHeaders(['cookie']) as HeadersInit,
  })
  buyouts.value = data.value
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-1">
      Выкупы
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Здесь формируются и оплачиваются выкупы на Wildberries. Для добавления нажмите на кнопку "Добавить выкупы".
    </p>
    <div class="flex justify-between mb-8 mt-6 items-center">
      <div class="hidden lg:block">
        <NuxtLink
          to="/buyouts" :class="{
            'btn-active': route.query.status === undefined,
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Все выкупы
        </NuxtLink>
        <NuxtLink
          to="/buyouts?status=active" :class="{
            'btn-active': route.query.status === 'active',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Активные
        </NuxtLink>
        <NuxtLink
          to="/buyouts?status=completed" :class="{
            'btn-active': route.query.status === 'completed',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Завершенные
        </NuxtLink>
        <NuxtLink
          to="/buyouts?status=archived" :class="{
            'btn-active': route.query.status === 'archived',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          В архиве
        </NuxtLink>
      </div>
      <select class="select select-bordered select-sm lg:hidden" @change="selectStatus">
        <option value="all" :selected="route.query.status === undefined">
          Все выкупы
        </option>
        <option value="active" :selected="route.query.status === 'active'">
          Активные
        </option>
        <option value="completed" :selected="route.query.status === 'completed'">
          Завершенные
        </option>
        <option value="archived" :selected="route.query.status === 'archived'">
          В архиве
        </option>
      </select>
      <NuxtLink to="/buyouts/create" class="btn btn-primary btn-sm gap-2 font-medium normal-case self-end">
        <Icon name="fluent:add-24-filled" size="24" />
        Добавить выкупы
      </NuxtLink>
    </div>
    <div v-if="buyouts.length">
      <transition-group
        class="cards grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" tag="ul"
        name="fade"
      >
        <BuyoutCard
          v-for="(buyout, index) of buyouts" :key="buyout.uuid" :place="buyouts.length - index"
          :index="index" :info="buyout" @unarchive="unarchiveBuyout" @archive="archiveBuyout"
          @open-modal="openModal" @remove="removeBuyout"
        />
      </transition-group>
      <div ref="target" class="p-2 w-full col-span-1" />
    </div>

    <div v-else class="hero">
      <div class="hero-content text-center flex justify-center items-center h-80">
        <div class="max-w-md">
          <h1 class="text-3xl font-bold">
            Здесь ничего нет <Icon name="fluent-emoji:thinking-face" />
          </h1>
        </div>
      </div>
    </div>
    <BuyoutInfoModal :info="selectedBuyout" :state="modal" :index="selectedIndex" @close="modal = false" />
  </div>
</template>

<style scoped></style>
