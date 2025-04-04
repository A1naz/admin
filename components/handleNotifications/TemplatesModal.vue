<script setup lang="ts">
const props = defineProps({
  state: { type: Boolean, required: false, default: false },
  selectedNotification: {
    type: Object,
    required: true,
  },
})

import { notify } from '@kyvg/vue3-notification'
const emit = defineEmits(['update:state', 'selectTemplate'])
const templates = ref<any>([])
const confirmModal = ref(false)
const selectedTemplate = ref('')

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

async function deleteTemplate() {
  const { data, error } = await useFetch('/api/notifications/deleteTemplate', {
    method: 'POST',
    query: {
      uuid: selectedTemplate.value,
    },
    watch: false,
  })
  if (data.value) {
    getNotificationsTemplates()
    emit('update:state', false)
  }
  if (error.value) {
    notify({
      title: 'Ошибка',
      text: error.value.message,
      type: 'error',
    })
  }
}
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
              <button
                class="btn btn-error"
                @click="
                  ;[(selectedTemplate = template.uuid), (confirmModal = true)]
                "
              >
                Удалить
              </button>
              <button
                class="btn btn-primary"
                @click="
                  ;[
                    $emit('selectTemplate', template),
                    $emit('update:state', false),
                  ]
                "
              >
                Выбрать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <StaticConfirmModal
    :title="'Подтвердить действие'"
    :description="'Вы уверены, что хотите удалить уведомление?'"
    :confirmFunction="deleteTemplate"
    v-model:state="confirmModal"
  />
</template>

<style scoped></style>
