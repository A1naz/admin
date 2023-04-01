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
const modalInfo = reactive({
    src: '',
    code: 0
})
const modal = ref(false)
const openModal = (code: number, src: string) => {
    console.log(code, src)
    modalInfo.src = src
    modalInfo.code = code
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
const { data } = await useFetch('/api/delivery/get', {
    method: 'GET',
    query: {
        status: route.query?.status || 'all',
        limit: 50,
    },
    headers: useRequestHeaders(['cookie']) as HeadersInit,
})
onMounted(async () => {
    deliveries.value = data.value
    console.log(data.value)

})
watch(targetIsVisible, async (isVisible) => {
    if (isVisible) {
        if (end.value) return
        const { data, error } = await useFetch('/api/delivery/get', {
            method: 'GET',
            query: {
                status: route.query?.status || 'all',
                limit: 50,
                skip: skip.value
            },
            headers: useRequestHeaders(['cookie']) as HeadersInit,
        })
        if ((data.value as any)?.length === 0) {
            end.value = true
            return
        }
        deliveries.value = [...deliveries.value, ...data.value! as any]
        skip.value += 50
    }
})
watch(route, async (newRoute) => {
    skip.value = 50
    end.value = false
    console.log(newRoute)
    const { data } = await useFetch('/api/delivery/get', {
        method: 'GET',
        query: {
            status: newRoute?.query?.status || 'all',
            limit: 50,
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
            В этом разделе можно отследить статусы выкупов после оплаты. Статус "Доставлен" означает, что товар можно
            забирать из пункта выдачи. </p>
        <div class="flex justify-between mb-8 mt-6 items-center">
            <select @change="selectStatus" class="select select-bordered select-sm">
                <option value="all" :selected="route.query.status === undefined">Все доставки</option>
                <option value="active" :selected="route.query.status === 'active'">Активные</option>
                <option value="completed" :selected="route.query.status === 'completed'">Завершенные</option>
            </select>
            <div class="flex items-center">
                <div class="flex items-center">
                    <input type="checkbox" v-model="openAll" class="checkbox checkbox-primary checkbox-sm" id="openAll">
                    <label for="openAll" class="cursor-pointer select-none ml-2">Развернуть все</label>
                </div>
            </div>
        </div>

        <div v-if="deliveries?.length" class="grid grid-cols-1 gap-3">
            <transition-group name="fade">
                <DeliveryExpand @open-modal="openModal" :state="openAll" v-for="(delivery, index) of deliveries"
                    :key="index" :info="delivery" />
            </transition-group>
            <div ref="target" class="flex justify-center items-center"></div>
            <QrModal v-if="modal" :code="modalInfo.code" :src="modalInfo.src" />
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



<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>