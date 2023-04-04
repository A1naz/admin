<script setup lang="ts">
const { $dayjs } = useNuxtApp();
const emit = defineEmits(['close']);
const currency = useCurrency()
const props = defineProps({
    info: {
        type: Object as any,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    state: {
        type: Boolean,
        required: true
    },

})
const store = useMainStore()
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

const getGender = computed(() => {
    switch (props.info.gender) {
        case 'male':
            return 'Мужской'
        case 'female':
            return 'Женский'
        case 'none':
            return 'Нет'
    }
})
</script>
<template>
    <Teleport to="body">
        <div ref="modal" :class="{
            'modal-open': state
        }" class="modal" id="buyoutInfoModal">
            <div v-if="state" class="modal-box max-w-2xl">
                <div class="">
                    <a @click="$emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</a>
                    <div class="text-xl font-bold">Информация о выкупе № {{ info.place }} </div>
                    <span class="text-xs text-gray-500">#{{ info.uuid }}</span>

                    <div class="flex flex-col gap-2 justify-center">
                        <div class="flex justify-between">
                            <span :class="{
                                'text-green-600': info.status === 'active',
                                'text-error': info.status === 'completed',
                                'text-warning': info.status === 'archived',
                            }">{{ getStatus }}</span>
                            <span class="text-sm text-gray-500">{{ $dayjs(info.createdAt).format('D MMMM HH:mm')
                            }}</span>
                        </div>
                        <div class="flex justify-between items-center flex-wrap">
                            <span class="text-gray-500 text-sm">Статус оплаты заказа:</span>
                            <span class="text-sm">{{ info.orderPaymentStatus }}</span>
                        </div>
                        <div class="flex justify-between items-center flex-wrap">
                            <span class="text-gray-500 text-sm">Статус оплаты сервиса:</span>
                            <span class="text-sm">{{ info.servicePaymentStatus }}</span>
                        </div>
                        <div class="flex justify-between items-center flex-wrap">
                            <span class="text-gray-500 text-sm">Поисковый запрос:</span>
                            <span class="text-sm">{{ info.searchQuery }}</span>
                        </div>
                        <div class="flex justify-between items-center flex-wrap">
                            <span class="text-gray-500 text-sm">Пол:</span>
                            <span class="text-sm">{{ getGender }}</span>
                        </div>
                        <div class="flex justify-between items-center flex-wrap">
                            <span class="text-gray-500 text-sm">Адрес:</span>
                            <span class="text-sm truncate w-60 justify-end text-end">{{ info.point }}</span>
                        </div>
                        <div class="flex justify-between items-center flex-wrap">
                            <span class="text-gray-500 text-sm">Правила:</span>
                            <span class="text-sm">{{ !info.rules.length ? 'Не выбраны' : info.rules.join(', ') }}</span>
                        </div>
                        <div class="flex justify-between items-center flex-wrap">
                            <span class="text-gray-500 text-sm">Даты выкупов:</span>
                            <span class="text-sm flex flex-col justify-center items-end">
                                <div>
                                    {{ `С ${$dayjs(info.dateStart).format('D MMMM HH:mm')}` }}
                                </div>
                                <div> {{ `По ${$dayjs(info.dateEnd).format('D MMMM HH:mm')}` }}</div>
                            </span>
                        </div>
                    </div>


                    <div class="divider"></div>

                    <div class="flex gap-4">
                        <div class="flex-none" style="width: 100px; height: 150px;">
                            <nuxt-img class="rounded-xl h-full" width="100" height="150"
                                :src="info?.product?.image || '/logo/logocolor.svg'"></nuxt-img>
                        </div>
                        <div class="flex flex-col truncate">
                            <div>
                                <div class=" truncate">{{ info.product?.name }}</div>
                                <a :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                                    class="text-sm text-secondary link link-hover">
                                    {{ info.article }}
                                </a>
                                <div>
                                    <span class="text-sm text-gray-500">Размер: </span>
                                    <span class="">{{ info.sizeparam === 'none' ? 'Не указан' : info.sizeparam }}</span>
                                </div>
                            </div>
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
            </div>

        </div>
    </Teleport>
</template>

<style scoped></style>