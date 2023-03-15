<template>
    <div>
        <nuxt-img v-if="store.theme === 'light'" src="/logo/logocolor.svg" :width="props.width" alt="TOPVTOP" srcset="" />
        <nuxt-img v-show="store.theme === 'dracula'" src="/logo/logowhite.svg" :width="props.width" alt="TOPVTOP"
            srcset="" />
    </div>
</template>

<script setup lang="ts">
import { useMainStore } from '~~/stores/main';
const props = defineProps({
    width: {
        type: String,
        default: '100px'
    }
})
const store = useMainStore()

</script>

<style scoped></style>