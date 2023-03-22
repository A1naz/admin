<script setup lang="ts">
import { storeToRefs } from '@pinia/nuxt/dist/runtime/composables';

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

const openModal = (index: number) => {
    store.drawerz = -10
    selectedIndex.value = index
    selectedBuyout.value = buyouts.value[index]
    setTimeout(() => {
        modal.value = true
    }, 50)

}
const { data } = await useFetch('/api/buyout/get', {
    method: 'GET',
    query: {
        status: route.query?.status || 'all',
    },
    headers: useRequestHeaders(['cookie']) as HeadersInit,
})
const removeBuyout = (uuid: string) => {
    buyouts.value = buyouts.value.filter((buyout: any) => buyout.uuid !== uuid)
}
const selectStatus = (e: Event) => {
    const target = e.target as HTMLSelectElement
    router.push({
        path: '/buyouts',
        query: {
            status: target.value
        }
    })
}
onMounted(async () => {
    buyouts.value = data.value
})

watch(route, async (newRoute) => {
    console.log(newRoute)
    const { data } = await useFetch('/api/buyout/get', {
        method: 'GET',
        query: {
            status: newRoute?.query?.status || 'all',
        },
        headers: useRequestHeaders(['cookie']) as HeadersInit,
    })
    buyouts.value = data.value

})
watch(modal, (value) => {
    if (value) {
    } else {
        store.drawerz = 1
    }
})
</script>
<template>
    <div>
        <h1 class="text-2xl font-bold mt-1">Выкупы</h1>
        <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
            Здесь формируются и оплачиваются выкупы на Wildberries. Для добавления, нажмите на кнопку "Добавить выкупы".
        </p>
        <div class="flex justify-between mb-8 mt-6 items-center">
            <div class="hidden lg:block">
                <NuxtLink to="/buyouts" :class="{
                    'btn-active': route.query.status === undefined,
                }" class="btn btn-ghost btn-sm normal-case font-medium">
                    Все выкупы
                </NuxtLink>
                <NuxtLink to="/buyouts?status=active" :class="{
                    'btn-active': route.query.status === 'active',
                }" class="btn btn-ghost btn-sm normal-case font-medium">
                    Активные
                </NuxtLink>
                <NuxtLink to="/buyouts?status=completed" :class="{
                    'btn-active': route.query.status === 'completed',
                }" class="btn btn-ghost btn-sm normal-case font-medium">
                    Завершенные
                </NuxtLink>
                <NuxtLink to="/buyouts?status=archived" :class="{
                    'btn-active': route.query.status === 'archived',
                }" class="btn btn-ghost btn-sm normal-case font-medium"> В архиве </NuxtLink>
            </div>
            <select @change="selectStatus" class="select select-bordered select-sm lg:hidden">
                <option value="all" :selected="route.query.status === undefined">Все выкупы</option>
                <option value="active" :selected="route.query.status === 'active'">Активные</option>
                <option value="completed" :selected="route.query.status === 'completed'">Завершенные</option>
                <option value="archived" :selected="route.query.status === 'archived'">В архиве</option>
            </select>
            <NuxtLink to="/buyouts/create" class="btn btn-primary btn-sm gap-2 font-medium normal-case text-white self-end">
                <Icon name="material-symbols:add" size="24"></Icon>
                Добавить выкупы
            </NuxtLink>
        </div>
        <div v-if="buyouts.length" v-auto-animate class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            <BuyoutCard @open-modal="openModal" @remove="removeBuyout" :index="index" v-for="(buyout, index) of buyouts"
                :key="buyout.uuid" :info="buyout"></BuyoutCard>
        </div>


        <div v-else class="hero">
            <div class="hero-content text-center flex justify-center items-center h-80">
                <div class="max-w-md">
                    <h1 class="text-3xl font-bold">Здесь ничего нет <Icon name="fluent-emoji:thinking-face"></Icon>
                    </h1>
                </div>
            </div>
        </div>
        <BuyoutInfoModal @close="modal = false" :info="selectedBuyout" :state="modal" :index="selectedIndex">
        </BuyoutInfoModal>
    </div>
</template>



<style scoped></style>