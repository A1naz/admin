<script setup lang="ts">
import QRCode from 'qrcode';
const { $dayjs } = useNuxtApp();
const currency = useCurrency()
const store = useMainStore()
const opened = ref()
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
    }
})
const qrCode = ref(null)
onMounted(async () => {
    opened.value = props.state
    console.log(props.info.receiptcodeqr)
    console.log(props.info.receiptcode)

})
watch(() => props.state, (newState) => {
    opened.value = newState
})
</script>

<template>
    <div class="collapse collapse-arrow border border-base-200 bg-base-100 rounded-box">
        <input v-model="opened" type="checkbox" />
        <div class="collapse-title text-xl font-medium">
            <div class="flex justify-between flex-wrap">
                <span> Доставка №{{ index + 1 }}
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

        </div>
        <div class="collapse-content">
            <div class="product flex gap-4 lg:gap-8 items-center flex-wrap">
                <nuxt-img :src="info.productimage" width="24" class="justify-self-start	rounded-lg"></nuxt-img>
                <div>
                    <div class="text-sm text-gray-500">Артикул</div>
                    <a :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                        class=" text-primary link link-hover">
                        {{ info.article }}
                    </a>
                </div>
                <div class="truncate w-50">
                    <div class="text-sm text-gray-500 ">Название</div>
                    {{ info.productname }}
                </div>
                <div>
                    <div class="text-sm text-gray-500">Размер</div>
                    {{ info.size }}
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
                <div>
                    <div class="text-sm text-gray-500">Адрес:</div>
                    <a class="text-primary link link-hover"
                        :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"> {{ info.point }}
                    </a>
                </div>
                <div>
                    <div class="text-sm text-gray-500">Код получения:</div>
                    {{ info?.receiptcode ? info?.receiptcode : 'Товар не доставлен' }}
                </div>
                <div v-if="info.receiptcodeqr">
                    <label @click="store.drawerz = -1" for="qr-modal" class="btn btn-primary btn-sm flex gap-2">
                        <Icon name="material-symbols:qr-code" size="24"></Icon> <span>QR-код</span>
                    </label>
                </div>
            </div>
        </div>
        <input type="checkbox" id="qr-modal" class="modal-toggle" />
        <label v-if="info.receiptcodeqr" @click="store.drawerz = 10" for="qr-modal" class="modal">
            <label class="modal-box relative w-80">
                <label @click="store.drawerz = 10" for="qr-modal"
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                <h3 class="text-lg font-bold mb-2">QR-Код для получения</h3>

                <div class="w-full flex flex-col justify-center items-center">
                    <img ref="qrCode" class="rounded-lg" height="250" :alt="info.receiptcode" width="250"
                        :src="`${props.info.receiptcodeqr}`" />
                </div>

            </label>
        </label>
    </div>
</template>

<style scoped></style>