
<script setup lang="ts">
import { vMaska } from "maska"
import { useNotification } from "@kyvg/vue3-notification";
import { useMemory } from '@vueuse/core'

function size(v: number) {
    const kb = v / 1024 / 1024
    return `${kb.toFixed(2)} MB`
}
const paymentCard = ref(null) as Ref<HTMLDivElement | null>
const { isSupported, memory } = useMemory()
const currency = useCurrency()
const url = ref('')
const paymentForm = reactive({
    paymentSum: 1000,
    cardNumber: '',
    cardDate: '',
    cardCvc: '',
})
const closePaymentModal = ref(null) as Ref<HTMLLabelElement | null>
const { notify } = useNotification()
const router = useRouter()
const loading = ref(false)
const checkForLink = async () => {
    loading.value = true
    const { data, error, refresh } = await useFetch('/api/payment/getLink', {
        method: 'GET',
        immediate: true,
    })
    if (error.value) {
        console.log(error)
        loading.value = false
        notify({
            title: 'Ошибка',
            text: 'Произошла ошибка при получении ссылки для оплаты',
            type: 'error',
        })
        return
    }
    if (data.value?.status === 'wait') {
        setTimeout(() => {
            checkForLink()
        }, 100)

    }
    if (data.value?.status === 'ok') {
        url.value = data.value?.url!
        loading.value = false
        window.open(url.value, '_blank')
    }

}
const pay = async () => {
    const { data, error } = await useFetch('/api/payment/create', {
        method: 'POST',
        body: {
            amount: paymentForm.paymentSum,
            cardNumber: paymentForm.cardNumber,
            cardDate: paymentForm.cardDate,
            cardCVC: paymentForm.cardCvc,
        }
    })
    if (error.value) {
        console.log(error)
        notify({
            title: 'Ошибка',
            text: 'Произошла ошибка при создании платежа',
            type: 'error',
        })
        return
    }
    if (data.value?.status === 'ok') {
        checkForLink()
    }
}

</script>

<template>
    <Teleport to="body">
        <input type="checkbox" id="payment-modal" class="modal-toggle" />
        <div class="modal">
            <label class="modal-box">
                <label ref="closePaymentModal" for="payment-modal"
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                <h3 class="text-xl font-bold mb-2">Пополнить баланс</h3>

                <div>
                    <div class="w-full flex flex-col gap-4 justify-center items-start" action="">
                        <div class="sum w-full">
                            <h3 class="text-lg mb-2">Сумма к пополнению</h3>
                            <PaymentInput v-model="paymentForm.paymentSum"></PaymentInput>
                        </div>
                        <div ref="paymentCard"
                            class="paymentCard flex flex-col gap-2 items-center justify-center mt-2 bg-neutral-focus p-6 rounded-lg shadow-xl">
                            <div class="cardNumber w-full">
                                <h3 class="text-lg mb-2 text-neutral-content">Номер карты</h3>
                                <input placeholder="0000 0000 0000 0000"
                                    class="input w-full text-neutral-content bg-neutral" v-maska
                                    data-maska="#### #### #### ####" type="text" v-model="paymentForm.cardNumber" />
                            </div>
                            <div class="cardInfo w-full flex justify-between gap-4">
                                <div>
                                    <h3 class="text-lg mb-2 text-neutral-content">Дата</h3>
                                    <input placeholder="ММ/ГГ" class="input w-full text-neutral-content bg-neutral" v-maska
                                        data-maska="##/##" type="text" v-model="paymentForm.cardDate" />
                                </div>
                                <div>
                                    <h3 class="text-lg mb-2 text-neutral-content">CVC/CVV</h3>
                                    <input placeholder="123" class="input w-full text-neutral-content bg-neutral"
                                        type="password" v-maska data-maska="###" v-model="paymentForm.cardCvc" />
                                </div>
                            </div>

                        </div>
                        <div v-show="url" class="truncate">
                            <div>Ссылка для оплаты:</div>
                            <a :href="url" target="_blank" class="link link-hover link-primary truncate">{{ url }}</a>
                        </div>

                    </div>

                </div>
                <div class="modal-action justify-between">
                    <label for="payment-modal" class="btn btn-ghost">Отмена</label>

                    <button @click="pay" class="btn btn-primary">Оплатить</button>
                </div>
            </label>
            <div v-if="loading"
                class="fixed z-[999999] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden bg-gray-700 opacity-80 flex flex-col items-center justify-center">
                <div class="ease-linear rounded-full mb-4">
                    <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white">
                    </Icon>
                </div>
                <h2 class="text-center opacity-100 text-white text-xl font-semibold">Загрузка...</h2>
                <p class="w-1/3 opacity-100 text-white text-center">Создается ссылка для оплаты, пожалуйста не
                    закрывайте
                    эту страницу</p>
                <div v-if="isSupported && memory" class="items-end justify-end inline-grid grid-cols-2 gap-x-4 gap-y-2">
                    <template v-if="memory">
                        <div opacity="50">
                            Used
                        </div>
                        <div>{{ size(memory.usedJSHeapSize) }}</div>
                        <div opacity="50">
                            Allocated
                        </div>
                        <div>{{ size(memory.totalJSHeapSize) }}</div>
                        <div opacity="50">
                            Limit
                        </div>
                        <div>{{ size(memory.jsHeapSizeLimit) }}</div>
                    </template>
                </div>
                <div v-else>
                    Your browser does not support performance memory API
                </div>
            </div>
        </div>

    </Teleport>
</template>


<style scoped></style>