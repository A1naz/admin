<script setup lang="ts">
definePageMeta({
    layout: 'app',
    auth: true,
    title: 'Доставки'
})
const openAll = ref(false)
const route = useRoute()
const router = useRouter()
const deliveries = ref([]) as any
const selectStatus = (e: Event) => {
    const target = e.target as HTMLSelectElement
    router.push({
        path: '/delivery',
        query: {
            status: target.value
        }
    })
}

const { data } = await useFetch('/api/delivery/get', {
    method: 'GET',
    query: {
        status: route.query?.status || 'all',
    },
    headers: useRequestHeaders(['cookie']) as HeadersInit,
})
onMounted(async () => {
    deliveries.value = data.value
    console.log(data.value)

})
watch(route, async (newRoute) => {
    console.log(newRoute)
    const { data } = await useFetch('/api/delivery/get', {
        method: 'GET',
        query: {
            status: newRoute?.query?.status || 'all',
        },
        headers: useRequestHeaders(['cookie']) as HeadersInit,
    })
    deliveries.value = data.value

})
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mt-1">Доставки</h1>
        <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
            Как только выкуп оплачен, он моментально появится в доставках. Дальше мы отслеживаем его статус. "Доставлен" -
            можно забирать с пункта выдачи. </p>
        <div class="flex justify-between mb-8 mt-6 items-center">
            <select @change="selectStatus" class="select select-bordered select-sm">
                <option value="all" :selected="route.query.status === undefined">Все доставки</option>
                <option value="active" :selected="route.query.status === 'active'">Активные</option>
                <option value="completed" :selected="route.query.status === 'completed'">Завершенные</option>
                <option value="archived" :selected="route.query.status === 'archived'">В архиве</option>
            </select>
            <div class="flex items-center">
                <div class="flex items-center">
                    <input type="checkbox" v-model="openAll" class="checkbox checkbox-primary checkbox-sm" id="openAll">
                    <label for="openAll" class="cursor-pointer select-none ml-2">Развернуть все</label>
                </div>
            </div>
        </div>
        <div v-if="deliveries.length" v-auto-animate class="grid grid-cols-1 gap-3">

            <DeliveryExpand :state="openAll" v-for="(delivery, index) of deliveries" :key="delivery.id"
                :index="deliveries.length - index - 1" :info="delivery" />
        </div>
        <div v-else class="hero">
            <div class="hero-content text-center flex justify-center items-center h-80">
                <div class="max-w-md">
                    <h1 class="text-3xl font-bold">Здесь ничего нет <Icon name="fluent-emoji:thinking-face"></Icon>
                    </h1>
                </div>
            </div>
        </div>
    </div>
</template>



<style lang="scss" scoped></style>