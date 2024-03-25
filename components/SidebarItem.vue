<script lang="ts" setup>
const props = defineProps<{
  title: string
  icon: string
  href: string
}>()
const route = useRoute()

const active = computed(() => {
  return route.path.includes(props.href.split('/')[1])
})

</script>

<template>
  <li v-if="props.href != '/autoanswer'">
    <NuxtLink class="mx-4 rounded-lg" :to="props.href">
      <div v-if="!active" class="flex">
        <Icon :name="icon" size="24" />
        <span
          class="ml-2 mt-[2px]"
          :class="{
            'opacity-100': !active,
          }"
          >{{ title }}</span
        >
      </div>
      <div v-else class="flex">
        <div class="hidden dark:block">
          <Icon :name="icon" color="#6466f1" size="24" />
        </div>
        <div class="dark:hidden">
          <Icon :name="icon" class="dark:hidden" color="#296dff" size="24" />
        </div>
        <span class="text-primary :hover:text-base-100 ml-2 mt-[2px]">{{
          title
        }}</span>
      </div>
    </NuxtLink>
  </li>
</template>

<style scoped>
.router-link-active {
  @apply text-primary bg-opacity-90 active:bg-transparent active:text-primary focus:bg-transparent focus:text-primary hover:bg-primary hover:text-primary;
}
</style>
