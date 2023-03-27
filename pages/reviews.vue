<script setup lang="ts">
definePageMeta({
    layout: 'app',
    auth: true,
    title: 'Отзывы',
})

const store = useMainStore();

const alert = reactive({
    show: false,
    message: '',
    type: 'success',
})
const { start, stop } = useTimeoutFn(() => {
    alert.show = false
}, 3000, { immediate: false })
const headers = useRequestHeaders(['cookie']) as HeadersInit


</script>
<template>
    <div>
        <Toast :type="alert.type" :active="alert.show">{{ alert.message }}</Toast>
        <div class="page-header mb-16">
            <h1 class="title">Отзывы</h1>
            <p class="description">
                На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно от выкупа согласно вашему тарифу.
            </p>
        </div>

    </div>
</template>



<style scoped></style>