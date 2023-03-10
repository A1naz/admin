<script lang="ts" setup>
const props = defineProps<{
  title: string
  icon: string
  href: string
}>()
const route = useRoute()

const currentPath = ref(useRoute().path)

watchEffect(() => {
  currentPath.value = route.path
})
</script>

<template>
  <li :class="{ 'bordered': currentPath == props.href }">
    <NuxtLink :to="props.href" class="mx-4 rounded-lg">
      <IconCSS :class="{
        'text-primary': currentPath == props.href
      }" :name="icon" size="24"></IconCSS><span>{{ title }}</span>
    </NuxtLink>
  </li>
</template>

<style scoped></style>
