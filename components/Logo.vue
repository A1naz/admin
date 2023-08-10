import { onMounted } from 'vue';
<script setup lang="ts">
const props = defineProps({
  width: {
    type: String,
    default: '100px',
  },
  height: {
    type: String,
    default: '44px',
  },
})
const colorMode = useColorMode()
</script>

<template>
  <nuxt-img v-show="$colorMode.value === 'light' || colorMode.unknown" src="/logo/logocolor.svg" :width="props.width" :height="props.height" alt="TOPVTOP" srcset="" />
  <nuxt-img v-show="$colorMode.value === 'dark'" src="/logo/logowhite.svg" :width="props.width" :height="props.height" alt="TOPVTOP" srcset="" />
</template>

<style scoped></style>
