<script setup lang="ts">
definePageMeta({
    layout: 'app',
    auth: true,
    breadcrumb: ['Выкупы'],
})
</script>
<template>
    <div>
        <h1 class="text-2xl font-bold mt-1">Выкупы</h1>
        <p class="text-sm text-gray-500 font-light mt-1">
            Здесь формируются и оплачиваются выкупы на Wildberries. Для добавления, нажмите на кнопку "Добавить выкуп".
        </p>
        <div class="flex justify-between mb-8 mt-4">
            <div>
                <button class="btn btn-ghost btn-sm normal-case font-medium btn-active">
                    Все выкупы
                </button>
                <button class="btn btn-ghost btn-sm normal-case font-medium">
                    Активные
                </button>
                <button class="btn btn-ghost btn-sm normal-case font-medium">
                    Завершенные
                </button>
            </div>
            <NuxtLink to="/buyouts/create" class="btn btn-primary btn-sm gap-2 font-medium normal-case text-white">
                <Icon name="material-symbols:add" size="24"></Icon>
                Добавить выкуп
            </NuxtLink>
        </div>
    </div>
</template>



<style scoped></style>