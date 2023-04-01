<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification';

const { $dayjs } = useNuxtApp();
const currency = useCurrency()
const router = useRouter();
const props = defineProps({
    info: {
        type: Object as any,
        required: true
    },
    index: {
        type: Number,
        required: true
    },

})
const emit = defineEmits(['callback', 'remove', 'openModal', 'archive', 'unarchive']);

const cloneBuyout = () => {
    router.push({
        path: '/buyouts/create',
        query: {
            uuid: props.info.uuid
        }
    })
}
const deleteBuyOut = async () => {
    const { data, error } = await useFetch('/api/buyout/delete', {
        method: 'DELETE',
        body: JSON.stringify({
            uuid: props.info.uuid
        }),
        headers: useRequestHeaders(['cookie']) as HeadersInit
    })
    if (error.value) {
        notify({
            title: 'Что-то пошло не так',
            text: error.value?.data?.message,
            type: 'error',
            duration: 3000
        })
    } else {
        notify({
            title: 'Успешно',
            text: 'Выкуп успешно удален',
            type: 'success',
            duration: 3000
        })
        emit('remove', props.info.uuid)
    }
}
const unarchiveBuyout = async () => {
    const { data, error } = await useFetch('/api/buyout/unarchive', {
        method: 'POST',
        body: JSON.stringify({
            uuid: props.info.uuid
        }),
        headers: useRequestHeaders(['cookie']) as HeadersInit
    })
    if (error.value) {
        notify({
            title: 'Что-то пошло не так',
            text: error.value?.data?.message,
            type: 'error',
            duration: 3000
        })
    } else {
        notify({
            title: 'Успешно',
            text: 'Выкуп успешно восстановлен',
            type: 'success',
            duration: 3000
        })
        emit('unarchive', props.info.uuid)
    }
}
const archiveBuyout = async () => {
    const { data, error } = await useFetch('/api/buyout/archive', {
        method: 'POST',
        body: JSON.stringify({
            uuid: props.info.uuid
        }),
        headers: useRequestHeaders(['cookie']) as HeadersInit
    })
    if (error.value) {
        notify({
            title: 'Что-то пошло не так',
            text: error.value?.data?.message,
            type: 'error',
            duration: 3000
        })
    } else {
        notify({
            title: 'Успешно',
            text: 'Выкуп успешно архивирован',
            type: 'success',
            duration: 3000
        })
        emit('archive', props.info.uuid)
    }
}
const getStatus = computed(() => {
    switch (props.info.status) {
        case 'active':
            return 'Активный'
        case 'completed':
            return 'Завершен'
        case 'archived':
            return 'В архиве'
    }
})
</script>
<template>
    <li>
        <div class="buyout-card card bg-base-200 shadow-lg">
            <div class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative">
                <div class="dropdown dropdown-end absolute right-2 top-2">
                    <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
                        <Icon name="ph:dots-three-outline-vertical-fill" size="18"></Icon>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a @click="cloneBuyout">
                                <Icon name="material-symbols:content-copy-outline"></Icon>Дублировать
                            </a></li>
                        <li v-if="info.status !== 'archived'"><a @click="archiveBuyout">
                                <Icon name="material-symbols:archive"></Icon>Архивировать
                            </a></li>
                        <li v-else><a @click="unarchiveBuyout">
                                <Icon name="material-symbols:unarchive"></Icon>Убрать из архива
                            </a></li>
                        <li v-if="info.orderPaymentStatus === 'Не оплачен' && info.servicePaymentStatus === 'Не оплачен'"><a
                                @click="deleteBuyOut">
                                <Icon name="material-symbols:delete-outline"></Icon>Удалить
                            </a></li>

                    </ul>
                </div>

                <div>
                    <h2 class="card-title">Выкуп №{{ info.place }}</h2>
                    <span class="text-xs text-gray-500 truncate">#{{ info.uuid }}</span>

                </div>
                <div class="flex justify-between">
                    <span :class="{
                        'text-green-600': info.status === 'active',
                        'text-error': info.status === 'completed',
                        'text-warning': info.status === 'archived',
                    }">{{ getStatus }}</span>
                    <span class="text-sm text-gray-500">{{ $dayjs(info.createdAt).format('D MMMM HH:mm')
                    }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-500 text-sm">Статус оплаты заказа:</span>
                    <span class="text-sm">{{ info.orderPaymentStatus }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-500 text-sm">Статус оплаты сервиса:</span>
                    <span class="text-sm">{{ info.servicePaymentStatus }}</span>
                </div>
                <div class="divider"></div>

                <div class="flex gap-4">
                    <div class="flex-none" style="width: 100px; height: 150px;">
                        <nuxt-img class="rounded-xl h-full" width="100" height="150"
                            :src="info?.product?.image || '/logo/logocolor.svg'"></nuxt-img>
                    </div>
                    <div class="flex flex-col justify-between truncate">
                        <div class="mb-2">
                            <div class=" truncate">{{ info.product?.name }}</div>
                            <a :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                                class="text-sm text-secondary link link-hover">
                                {{ info.article }}
                            </a>
                        </div>
                        <div class="">
                            <div>
                                <span class="text-sm text-gray-500">Цена: </span>
                                <span class="">{{ info.product?.priceText }}</span>
                            </div>
                            <div>
                                <span class="text-sm text-gray-500">Количество: </span>
                                <span class="">{{ info.quantity }} шт.</span>
                            </div>
                            <div>
                                <span class="text-sm text-gray-500">Сумма: </span>
                                <span class="">{{ currency.format(info.quantity * info.product?.price) }}</span>
                            </div>
                        </div>


                    </div>

                </div>
                <div class="divider"></div>
                <button @click="$emit('openModal', index)" class="btn">Открыть</button>


            </div>
        </div>
    </li>
</template>


<style scoped></style>