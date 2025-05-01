  <script setup lang="ts">
  defineProps({
    title: String,
    value: String,
    subtitle: String
  })
  </script>

<template>
    <div class="flex-1 min-w-[200px] p-4 rounded-lg border border-gray-200">
      <div class="text-sm ">{{ title }}</div>
      <div class="text-2xl font-bold  mt-1">{{ value }}</div>
      <div class="text-xs  mt-1">{{ subtitle }}</div>
    </div>
  </template>
  
  