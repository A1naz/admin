<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },

})
const emit = defineEmits(['close'])
const { $dayjs } = useNuxtApp()
const currency = useCurrency()
const store = useMainStore()
const logs = ref<any[]>([])
const { data, error } = await useFetch('/api/buyout/getLogs', {
  method: 'GET',
  query: {
    uuid: props.info.uuid,
  },
})
if (data.value)
  logs.value = data.value
</script>

<template>
  <div
    id="buyoutLogModal" :class="{
      'modal-open': state,
    }" class="modal"
  >
    <div v-if="state" class="modal-box max-w-2xl">
      <div class="">
        <a class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('close')">✕</a>
        <div class="text-xl font-bold flex items-center gap-2">
          <IconCSS name="fluent:send-logging-24-filled" />
          <span>
            Инфо о выкупе
          </span>
        </div>
        <div class="text-xs text-gray-500">
          #{{ info.uuid }}
        </div>

        <div v-if="logs.length" class="flex flex-col gap-2 mt-2 justify-center">
          <div v-for="log of logs" :key="log._id" class="log p-2 bg-base-200 rounded-lg flex justify-between gap-4 items-start">
            <div class="logText w-2/3">
              {{ log.text }}
            </div>
            <div class="logDate">
              {{ $dayjs(log.date).format('D MMMM HH:mm') }}
            </div>
          </div>
        </div>
        <Hero v-else />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
