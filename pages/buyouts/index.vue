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
const logModal = ref(false)
const selectedBuyout = ref({})
const selectedIndex = ref(-1)
const store = useMainStore()
const selectedPlace = ref(-1)
const status = computed(() => route.query?.status || 'all')
const dateFilter = ref('all')
const autoTarget = ref(true)
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
function openModal(index: number) {
  selectedIndex.value = index
  selectedPlace.value = buyouts.value.length - index
  selectedBuyout.value = buyouts.value[index]
  modal.value = true
}
function openLogModal(index: number) {
  selectedIndex.value = index
  selectedPlace.value = buyouts.value.length - index
  selectedBuyout.value = buyouts.value[index]
  logModal.value = true
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
async function getBuyouts() {
  const { data } = await useFetch(() => '/api/buyout/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      dateFilter: dateFilter.value,
      limit: 50,
    },
  })
  buyouts.value = data.value
}

await getBuyouts()
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
function unpauseBuyout(uuid: string) {
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

async function selectFilterDate(e: Event) {
  const target = e.target as HTMLSelectElement
  dateFilter.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/buyout/get', {
    method: 'GET',
    query: {
      status: status.value || 'all',
      dateFilter: dateFilter.value,
      limit: 50,
    },
  })
  buyouts.value = data.value
}
async function findBuyouts(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    search.loading = false
    getBuyouts()
    return
  }
  const { data, error } = await useFetch('/api/buyout/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value)
    buyouts.value = data.value

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  autoTarget.value = false
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}
onMounted(async () => {
  if (route.query?.uuid) {
    const uuid = route.query?.uuid
    if (buyouts.value) {
      const index = buyouts.value!.findIndex((buyout: any) => buyout.uuid === uuid)
      if (index !== -1) {
        openModal(index)
      }
      else {
        const { data, error } = await useFetch('/api/buyout/getOne', {
          method: 'GET',
          query: {
            uuid,
          },
        })

        if (data.value) {
          buyouts.value = [data.value, ...buyouts.value]
          openModal(0)
        }
      }
    }
  }
})

const activeBuyouts = computedEager(() => {
  if (!buyouts.value.length)
    return []
  const result = buyouts.value.filter((buyout: any) => buyout.status === 'active')
  return result
})
const availableBuyouts = computedEager(() => {
  if (!activeBuyouts.value.length)
    return null
  let balance = store.client.balance
  let result = 0
  activeBuyouts.value.forEach((buyout: any) => {
    balance -= buyout.product.price * buyout.quantity
    if (balance >= 0)
      result++
  })
  return result
})
const neededDeposit = computedEager(() => {
  let result = 0
  let sum = 0
  activeBuyouts.value.forEach((buyout: any) => {
    sum += buyout.product.price * buyout.quantity
  })
  if (sum > store.client.balance)
    result = sum - store.client.balance

  return result
})
const formatAvailable = computedEager(() => {
  if (!availableBuyouts.value)
    return ''
  const str = availableBuyouts.value.toString()
  const lastNumber = Number(str[str.length - 1])
  if (Number(str) > 10 && Number(str) < 20)
    return 'выкупов'
  if (lastNumber === 1)
    return 'выкуп'
  if (lastNumber > 1 && lastNumber < 5)
    return 'выкупа'
  else
    return 'выкупов'
})
watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value) {
    if (end.value)
      return
    const { data } = await useFetch('/api/buyout/get', {
      method: 'GET',
      query: {
        status: route.query?.status || 'all',
        limit: 50,
        dateFilter: dateFilter.value,
        skip: skip.value,
      },
    })
    if ((data.value as any).length === 0) {
      end.value = true
      return
    }
    buyouts.value = [...buyouts.value, ...(data.value as any)]
    skip.value += 50
  }
})
watch(() => status.value, async () => {
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/buyout/get', {
    method: 'GET',
    query: {
      status: status.value || 'all',
      dateFilter: dateFilter.value,
      limit: 50,
    },
  })
  buyouts.value = data.value
}, { deep: true, immediate: true })
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mt-4">
      Выкупы
      <div class="tooltip tooltip-bottom" data-tip="Видео-инструкция по выкупам">
        <a class="hover:text-primary" target="_blank" href="https://youtu.be/QQf2mYMZkN8">
          <IconCSS size="24" class="h-8 w-8" name="uil:youtube" />
        </a>
      </div>
    </h1>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Здесь формируются и оплачиваются выкупы на Wildberries. Для добавления нажмите на кнопку "Добавить выкупы".
    </p>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Стоимость одного выкупа -  <span class="font-bold">60 руб.</span>
    </p>
    <p v-if="route.query.status === 'archived'" class="text-xs font-light mt-1 lg:text-sm">
      Выкупы в архиве удаляются через 10 дней.
    </p>
    <div class="flex justify-between mb-4 items-center mt-6">
      <div class="hidden lg:block">
        <NuxtLink
          to="/buyouts" :external="false" :class="{
            'btn-active': route.query.status === undefined,
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Все выкупы
        </NuxtLink>
        <NuxtLink
          to="/buyouts?status=active" :external="false" :class="{
            'btn-active': route.query.status === 'active',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Активные
        </NuxtLink>
        <NuxtLink
          to="/buyouts?status=archived" :external="false" :class="{
            'btn-active': route.query.status === 'archived',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          В архиве
        </NuxtLink>
        <NuxtLink
          to="/buyouts?status=completed" :external="false" :class="{
            'btn-active': route.query.status === 'completed',
          }" class="btn btn-ghost btn-sm normal-case font-medium"
        >
          Завершенные
        </NuxtLink>
      </div>
      <select class="select select-bordered select-sm lg:hidden" @change="selectStatus">
        <option value="all" :selected="route.query.status === undefined">
          Все выкупы
        </option>
        <option value="active" :selected="route.query.status === 'active'">
          Активные
        </option>
        <option value="archived" :selected="route.query.status === 'archived'">
          В архиве
        </option>
        <option value="completed" :selected="route.query.status === 'completed'">
          Завершенные
        </option>
      </select>
      <div class="flex items-center gap-2 flex-wrap">
        <a href="info/Информационная таблица по выкупам.xlsx" class="btn btn-sm">
          Скачать шаблон
        </a>
        <NuxtLink to="/buyouts/create" class="btn btn-primary btn-sm gap-2 font-medium normal-case self-end">
          <Icon name="fluent:add-24-filled" size="24" />
          Добавить выкупы
        </NuxtLink>
      </div>
    </div>
    <div class="search flex justify-between items-center mb-4 flex-wrap gap-2">
      <select class="select select-bordered select-sm" @change="selectFilterDate">
        <option value="all">
          За все время
        </option>
        <option value="today">
          Сегодня
        </option>
        <option value="3days">
          3 дня
        </option>
        <option value="7days">
          Неделя
        </option>
      </select>
      <div class="flex gap-1 items-center">
        <select v-model="search.type" class="select select-bordered select-sm">
          <option value="article">
            Артикул
          </option>
          <option value="uuid">
            ID выкупа
          </option>
          <option value="name">
            Имя товара
          </option>
        </select>
        <div class="relative flex items-center flex-grow-0 w-full">
          <input v-model="search.text" type="text" class="input input-sm input-bordered" placeholder="Поиск" @input="onSearchInput($event)">

          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2"
          />
        </div>
      </div>
    </div>
    <div v-if="buyouts.length">
      <div v-if="(route.query.status === 'active' || !route.query.status) && activeBuyouts.length > 0" class="flex justify-center py-2 rounded-lg px-2 mb-2 bg-base-100 border border-base-200">
        <p
          v-if="availableBuyouts" :class="{
            'text-success': availableBuyouts === activeBuyouts.length,
          }" class="text-sm"
        >
          {{ availableBuyouts === activeBuyouts.length ? 'Баланса хватит на все выкупы' : `Баланса хватит на ${availableBuyouts} ${formatAvailable} из ${activeBuyouts.length}.` }} <span v-if="neededDeposit > 0">{{ `Пополните баланс на ${Math.round(neededDeposit)} для выполнения всех выкупов.` }}</span>
        </p>
        <p v-if="availableBuyouts === 0 && activeBuyouts.length > 0" class="text-center text-warning text-sm">
          Недостаточно средств для совершения выкупа, пополните баланс.
        </p>
      </div>
      <div v-else class="px-2 py-4 mb-2" />
      <div>
        <TransitionSlide group class="cards grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 h-full">
          <BuyoutCard
            v-for="(buyout, index) of buyouts" :key="buyout.uuid" :place="buyouts.length - index"
            :index="index" :info="buyout" @unarchive="unarchiveBuyout" @archive="archiveBuyout"
            @open-modal="openModal" @remove="removeBuyout" @unpause="unpauseBuyout" @open-log-modal="openLogModal"
          />
        </TransitionSlide>
      </div>
      <div ref="target" class="p-2 w-full col-span-1" />
    </div>

    <Hero v-else />
    <BuyoutLogModal v-if="logModal" :info="selectedBuyout" :index="selectedIndex" :state="logModal" @close="logModal = false" />
    <BuyoutInfoModal v-if="modal" :info="selectedBuyout" :state="modal" :index="selectedIndex" @close="modal = false" />
  </div>
</template>

<style scoped></style>
