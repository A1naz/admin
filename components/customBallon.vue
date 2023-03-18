<template>
    <div class="card">
        <div>
            <div class="text-lg font-semibold">Пункт выдачи Wildberries</div>
            <div class="text-sm">{{ point.a }}</div>
            <div class="text-sm">{{ point.w }}</div>
            <a href="#" @click="selectPoint" class="mt-4 flex justify-center btn btn-primary">Выбрать</a>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    point: any
}>()
const emit = defineEmits(['select'])
const selectPoint = () => {
    emit('select', props.point.a)
}
</script>

<style scoped></style>