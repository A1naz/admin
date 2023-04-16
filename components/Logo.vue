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
  <ColorScheme placeholder="TOP VTOP" tag="div">
    <nuxt-img v-if="colorMode.value === 'light'" src="/logo/logocolor.svg" :width="props.width" :height="props.height" alt="TOPVTOP" srcset="" />
    <nuxt-img v-else src="/logo/logowhite.svg" :width="props.width" :height="props.height" alt="TOPVTOP" srcset="" />
  </ColorScheme>
</template>

<style scoped></style>
