<script setup lang="ts">
const { $dayjs } = useNuxtApp();

const props = defineProps({
    info: {
        type: Object as any,
        required: true
    },

})
</script>
<template>
    <div class="buyout-card card bg-base-200 shadow-lg">
        <div class="card-body flex-shrink-0 flex flex-col justify-start p-4">
            <h1 class="card-title truncate">Выкуп </h1>
            <span class="text-sm text-gray-500">#{{ info.uuid }}</span>
            <div class="flex justify-between">
                <span :class="{
                    'text-success': info.status === 'Активный',
                    'text-error': info.status === 'Завершен',
                }">{{ info.status }}</span>
                <span class="card-subtitle text-gray-500 truncate">{{ $dayjs(info.createdAt).format('D MMMM HH:mm')
                }}</span>
            </div>
            <div>
                
            </div>
            <div class="divider"></div>

            <div class="flex gap-4">
                <div style="width: 100px; height: 150px;">
                    <nuxt-img class="rounded-xl" width="100" height="150"
                        :src="info?.product?.image || '/logo/logocolor.svg'"></nuxt-img>
                </div>
                <div class="flex flex-col truncate">
                    <span class="card-subtitle truncate">{{ info.product?.name }}</span>
                    <a :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                        class="text-sm text-primary link link-hover">
                        {{ info.article }}
                    </a>
                    <div>

                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Цена: </span>
                        <span class="card-subtitle">{{ info.product?.price }} ₽</span>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Количество: </span>
                        <span class="card-subtitle">{{ info.quantity }} шт.</span>

                    </div>

                </div>

            </div>
            <div class="divider"></div>
            <button class="btn">Открыть</button>


        </div>
    </div>
</template>


<style scoped></style>