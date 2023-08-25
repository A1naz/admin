<script setup lang="ts">
interface status {
  status: string
  date: string
}
interface Props {
  statusdelivery: status[]
  state: Boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])
const { $dayjs } = useNuxtApp()
const currency = useCurrency()
const store = useMainStore()

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
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

        <div v-if="statusdelivery.length">
          <ul class="steps steps-vertical">
            <li v-for="(status, index) of statusdelivery" :key="index" class="step step-primary">
              <div class="flex gap-2 items-center justify-between">
                <div>
                  {{ status.status }}
                </div>
                <div class="text-sm">
                  {{ $dayjs(status.date).format('D MMMM HH:mm') }}
                </div>
              </div>
            </li>
          </ul>
        </div>
        <Hero v-else />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
