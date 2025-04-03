<script setup lang="ts">
const props = defineProps({
  state: { type: Boolean, required: false, default: false },
  selectedNotification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:state', "selectTemplate"])
const templates = ref<any>([])

async function getNotificationsTemplates() {
  const { data, error } = await useFetch('/api/notifications/templates', {
    method: 'GET',
    watch: false,
  })
  if (data.value) {
    templates.value = data.value
  }
}

getNotificationsTemplates()
</script>

<template>
  <div
    :class="{ 'modal-open': state }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div class="modal-box cursor-auto max-w-[800px]" @click.stop>
      <div class="flex flex-col gap-1">
        <div
          class="collapse bg-base-100 border-base-300 border"
          v-for="template in templates"
          :key="template.id"
        >
          <input type="checkbox" />
          <div class="collapse-title font-semibold">
            {{ template.category }}
          </div>
          <div class="collapse-content text-sm">
            {{ template.text }}
            <div class="mt-2 flex justify-end gap-2">
              <button class="btn btn-primary" @click="[$emit('selectTemplate', template), $emit('update:state', false)]">Выбрать</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
