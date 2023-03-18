<script setup lang="ts">
definePageMeta({
    layout: 'app',
    auth: true,
    title: 'Выкупы',
})

const route = useRoute()
const buyouts = ref([]) as any
const { data } = await useFetch('/api/buyout/get', {
    method: 'GET',
    query: {
        status: route.query?.status || 'all',
    },
    headers: useRequestHeaders(['cookie']) as HeadersInit,
})

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
            </div>
            <select class="select select-bordered select-sm lg:hidden">
                <option selected>Все выкупы</option>
                <option>Активные</option>
                <option>Завершенные</option>
            </select>
            <NuxtLink to="/buyouts/create" class="btn btn-primary btn-sm gap-2 font-medium normal-case text-white self-end">
                <Icon name="material-symbols:add" size="24"></Icon>
                Добавить выкупы
            </NuxtLink>
        </div>
        <div class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            <BuyoutCard v-for="buyout in buyouts" :key="buyout.uuid" :info="buyout"></BuyoutCard>
        </div>
    </div>
</template>



<style scoped></style>