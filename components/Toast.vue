<script lang="ts" setup>
const props = defineProps<{
  active: boolean
  type: any
}>()

</script>

<template>
  <transition name="toast">
    <div class="toast alert shadow-lg fixed top-4 h-14 w-40 left-4" :class="{
      'alert-success': type === 'success',
      'alert-error': type === 'error',
      'alert-warning': type === 'warning',
      'alert-info': type === 'info',
    }" v-if="active">
      <div>

        <slot />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.toast-enter-from {
  opacity: 0;
  transform: translateY(-60px);
}

/* .toast-enter-to {
  opacity: 1;
  transform: translateY(0);
} */
.toast-enter-active {
  transition: all 0.3s ease;
}

/* leave transitions */
/* .toast-leave-from {
  opacity: 1;
  transform: translateY(0);
} */
.toast-leave-to {
  opacity: 0;
  transform: translateY(-60px);
}

.toast-leave-active {
  transition: all 0.3s ease;
}
</style>
