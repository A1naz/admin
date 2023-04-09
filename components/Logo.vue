<script setup lang="ts">
import { useMainStore } from '~~/stores/main'

const props = defineProps({
  width: {
    type: String,
    default: '100px',
  },
})

const colorMode = useColorMode()

const theme = ref('light')
const store = useMainStore()
onMounted(async () => {
  theme.value = colorMode.value
})
watch(colorMode, (val) => {
  theme.value = val.value
})
</script>

<template>
  <div>
    <nuxt-img v-if="theme === 'light'" src="/logo/logocolor.svg" :width="props.width" alt="TOPVTOP" srcset="" />
    <nuxt-img v-else src="/logo/logowhite.svg" :width="props.width" alt="TOPVTOP" srcset="" />
  </div>
</template>

<style scoped></style>
