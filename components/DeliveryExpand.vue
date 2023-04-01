<script setup lang="ts">
import QRCode from 'qrcode';
const { $dayjs } = useNuxtApp();
const currency = useCurrency()
const store = useMainStore()
const opened = ref()
const emit = defineEmits(['openModal']);
const props = defineProps({
    info: {
        type: Object as any,
        required: true
    },
    state: {
        type: Boolean,
    }
})
const qrCode = ref(null)
onMounted(async () => {
    opened.value = props.state

})
watch(() => props.state, (newState) => {
    opened.value = newState
})
</script>

<template>
    <div class="collapse collapse-arrow border border-base-200 bg-base-100 rounded-box overflow-visible">
        <input v-model="opened" type="checkbox" />
        <div class="collapse-title relative text-xl font-medium">
            <div class="flex justify-between flex-wrap">
                <span> Доставка №{{ info.place }}
                </span>
                <label class="text-[0.6rem] lg:text-xs text-gray-500">#{{ info.uuid }}</label>
            </div>
            <div class="flex justify-between flex-wrap">
                <div class="text-sm"><span class="text-gray-400">Статус: </span> <span>
                        {{ info.currentstatus }}
                    </span>
                </div>

                <div class="mt-2 lg:m-0 text-xs">Обновлено {{ $dayjs(info.updatedAt).format('D MMMM HH:mm') }}
                </div>
            </div>
            <nuxt-img fit="fill" :class="{
                'opacity-0': opened
            }" :src="info.productimage" width="36"
                class="absolute top-4 left-64 rounded-lg transition-opacity ease-in-out duration-200"></nuxt-img>
        </div>
        <div class="collapse-content">
            <div class="product flex gap-4 lg:gap-8 items-center flex-wrap overflow-visible">
                <div class="dropdown dropdown-hover z-10 static">
                    <label tabindex="0"> <nuxt-img width="24" class="rounded-lg" loading="lazy" fit="fill"
                            :src="info.productimage"></nuxt-img>
                    </label>
                    <ul tabindex="0" class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52">
                        <nuxt-img class="rounded-lg" loading="lazy" fit="fill" :src="info.productimage"></nuxt-img>
                    </ul>

                </div>
                <div>
                    <div class="text-sm text-gray-500">Артикул</div>
                    <a :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                        class=" text-secondary link link-hover">
                        {{ info.article }}
                    </a>
                </div>
                <div class="truncate w-50">
                    <div class="text-sm text-gray-500 ">Название</div>
                    {{ info.productname }}
                </div>
                <div>
                    <div class="text-sm text-gray-500">Размер</div>
                    {{ info.size === 'none' ? 'Не указан' : info.size }}
                </div>
                <div class="flex-end">
                    <div class="text-sm text-gray-500">Цена</div>
                    {{ currency.format(info.pricebuy) }}
                </div>

            </div>
            <div class="divider">
            </div>
            <div class="receipt flex gap-4 lg:gap-8 items-center flex-wrap">
                <div>
                    <div class="text-sm text-gray-500">Получатель:</div>
                    {{ info.recipient }} {{ info.recipientphone }}
                </div>
                <div class="w-60 overflow-hidden truncate">
                    <div class="text-sm text-gray-500">Адрес:</div>
                    <a target="_blank" class="text-secondary link link-hover w-60 truncate "
                        :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"> {{ info.point }}
                    </a>
                </div>
                <div>
                    <div class="text-sm text-gray-500">Код получения:</div>
                    {{ info?.receiptcode ? info?.receiptcode : 'Товар не доставлен' }}
                </div>
                <div v-if="info.receiptcodeqr">
                    <label for="qr-modal" @click="emit('openModal',
                        info.receiptcode,
                        info.receiptcodeqr
                    )" class="btn btn-primary btn-sm flex gap-2">
                        <Icon name="material-symbols:qr-code" size="24"></Icon> <span>QR-код</span>
                    </label>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped></style>