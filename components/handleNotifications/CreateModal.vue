<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
})

const usersModal: any = ref(null)
const emit = defineEmits(['update:isModalOpen'])

const notifactionForm = ref({
  isAllUsersSelected: false,
  selectedUsers: [],
  title: '',
  description: '',
  activationDate: new Date(Date.now() + 1000 * 60 * 5),
  isImmediate: false,
})

function openUsersModal() {
  usersModal.value?.openModal()
}

async function createNotification() {
  const { data, error } = await useFetch('/api/notifications/create', {
    method: 'POST',
    body: notifactionForm.value,
    watch: false,
  })
  if (error.value) {
    notify({
      title: 'Ошибка',
      text: error.value.message,
    })
    return
  }

  notify({
    title: 'Успех',
    text: 'Уведомление успешно создано',
  })
  emit('update:isModalOpen', false)
}
async function createNotificationTemplate() {
  const { data, error } = await useFetch('/api/notifications/createTemplate', {
    method: 'POST',
    body: notifactionForm.value,
    watch: false,
  })
  if (error.value) {
    notify({
      title: 'Ошибка',
      text: error.value.message,
    })
    return
  }
  notify({
    title: 'Успех',
    text: 'Шаблон уведомления успешно создано',
  })
  emit('update:isModalOpen', false)
}
</script>
<template>
  <div
    id="selectUsers"
    class="modal overflow-y-auto z-50"
    :class="{ 'modal-open': isModalOpen }"
  >
    <div class="modal-box cursor-auto max-w-full w-1/3" @click.stop>
      <form method="dialog">
        <label
          for="selectUsers"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="$emit('update:isModalOpen', false)"
        >
          ✕
        </label>
      </form>
      <div class="flex flex-col w-full gap-3">
        <div>
          <button class="btn">Шаблоны</button>
        </div>
        <div>
          <p class="mb-1">Выбрать клиентов</p>
          <div class="w-full">
            <div class="flex justify-start items-center gap-2">
              <button
                class="btn"
                @click="openUsersModal"
                :disabled="notifactionForm.isAllUsersSelected"
              >
                {{
                  notifactionForm.selectedUsers.length > 0
                    ? 'Выбрано Клиентов: ' +
                      notifactionForm.selectedUsers.length
                    : 'Выбрать Клиентов'
                }}
              </button>
              <label class="label cursor-pointer">
                <span class="label-text mr-4">Выбрать всех</span>
                <input
                  type="checkbox"
                  class="checkbox checkbox-primary"
                  :checked="notifactionForm.isAllUsersSelected"
                  @click="
                    notifactionForm.isAllUsersSelected =
                      !notifactionForm.isAllUsersSelected
                  "
                />
              </label>
            </div>
          </div>
        </div>

        <input
          type="text"
          class="input input-bordered w-full"
          placeholder="Название"
          v-model="notifactionForm.title"
        />
        <input
          type="text"
          class="input input-bordered w-full"
          placeholder="Описание"
          v-model="notifactionForm.description"
        />
        <div class="flex justify-start w-[102px]">
          <DateOnlyPicker
            :disabled="notifactionForm.isImmediate"
            ref="datePicker"
            :modelValue="notifactionForm.activationDate"
            :min-date="new Date(Date.now() - 1000 * 60 * 60 * 24)"
            size="sm"
            @update:modelValue="notifactionForm.activationDate = $event"
          />
          <label class="label cursor-pointer">
            <span class="label-text mr-4">Сразу</span>
            <input
              type="checkbox"
              class="checkbox checkbox-primary"
              v-model="notifactionForm.isImmediate"
            />
          </label>
        </div>
      </div>
      <div class="modal-action">
        <button
          @click="createNotificationTemplate"
          class="btn btn-neutral"
          :disabled="
            !notifactionForm.title ||
            !notifactionForm.description ||
            (!notifactionForm.isAllUsersSelected &&
              notifactionForm.selectedUsers.length === 0)
          "
        >
          Шаблон
        </button>
        <button class="btn" @click="$emit('update:isModalOpen', false)">
          Отмена
        </button>
        <button
          class="btn btn-primary"
          @click="createNotification"
          :disabled="
            !notifactionForm.title ||
            !notifactionForm.description ||
            (!notifactionForm.isAllUsersSelected &&
              notifactionForm.selectedUsers.length === 0)
          "
        >
          Создать
        </button>
      </div>
    </div>

    <HandleNotificationsManyUsers
      :selectedUsers="notifactionForm.selectedUsers"
      ref="usersModal"
    />
  </div>
</template>
