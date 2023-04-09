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
  <li>
    <NuxtLink :to="props.href" class="mx-4 rounded-lg">
      <Icon
        :class="{
          'opacity-70': !currentPath.includes(props.href),
          'text-primary': currentPath.includes(props.href),
        }" :name="icon" size="24"
      /><span
        :class="{
          'opacity-70': !currentPath.includes(props.href),
        }" class=""
      >{{ title }}</span>
    </NuxtLink>
  </li>
</template>

<style scoped></style>
