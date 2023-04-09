<script setup lang="ts">
const props = defineProps<{
  point: any
}>()
const emit = defineEmits(['select'])
function selectPoint() {
  emit('select', props.point.a)
}
</script>

<template>
  <div class="card">
    <div>
      <div class="text-lg font-semibold">
        Пункт выдачи Wildberries
      </div>
      <div class="text-sm">
        {{ point.a }}
      </div>
      <div class="text-sm">
        {{ point.w }}
      </div>
      <a href="#" class="mt-4 flex justify-center btn btn-primary" @click="selectPoint">Выбрать</a>
    </div>
  </div>
</template>

<style scoped></style>
