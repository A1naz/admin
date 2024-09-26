<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props = defineProps({
  templates: {
    type: Array as any,
    default: () => [],
  },
})

const templates = toRef(props, 'templates')
const isModalOpen = ref(false)
const emit = defineEmits([
  'useTemplate',
  'deleteTemplate',
  'setTemplate',
  'isModalTemplateOpen',
])

watch(isModalOpen, (newValue) => {
  emit('isModalTemplateOpen', isModalOpen.value)
})

defineExpose({
  isModalOpen,
})
</script>
<template>
  <button class="btn btn-primary btn-sm mx-1" @click="isModalOpen = true">
    Шаблоны
  </button>
  <!-- <div

    :class="{ 'modal-open': state }" 
    class="modal"
  > -->
  <div
    id="selectUsers"
    class="modal overflow-y-auto z-50 cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="isModalOpen = false"
  >
    <div class="modal-box w-9/12 max-w-full cursor-auto h-full" @click.stop>
      <form method="dialog">
        <label
          for="selectUsers"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="isModalOpen = false"
        >
          ✕
        </label>
      </form>

      <div
        v-if="templates && templates.length > 0"
        v-for="(info, index) in templates"
        class="collapse collapse-arrow border border-base-100 bg-base-200 rounded-box z-0 overflow-hidden mt-5"
      >
        <input type="checkbox" />
        <div
          class="collapse-title relative text-md font-medium flex flex-col md:justify-between md:flex-row"
        >
          <div>
            <div>
              {{ info.title }}
            </div>
          </div>
          <div class="flex z-10 gap-2">
            <label
              class="btn btn-sm text-red-400 z-10"
              @click="emit('deleteTemplate', templates[index])"
              >Удалить</label
            >
            <label
              @click="
                ;[$emit('useTemplate', info.usersArray), (isModalOpen = false)]
              "
              class="btn btn-sm btn-primary truncate mr-1 bg-opacity-20 border-none text-base-content"
              >Добавить к текущим</label
            >
            <label
              @click="
                ;[$emit('setTemplate', info.usersArray), (isModalOpen = false)]
              "
              class="btn btn-sm btn-primary truncate mr-1 border-none text-base-100"
              >Добавить</label
            >
          </div>
        </div>
        <div
          class="collapse-content flex items-center justify-center md:justify-start gap-2 max-h-[56rem] md:max-h-full flex-row space-x-2 overflow-x-auto"
        >
          <table class="table my-3">
            <thead class="p-0">
              <tr>
                <th>id</th>
                <th>username</th>
                <th>email</th>
                <th>telegram</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="hover"
                v-for="user in info.usersArray"
                :key="user.uuid"
              >
                <td style="max-width: 130px">{{ user.uuid }}</td>
                <td style="max-width: 150px">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.username }}
                  </div>
                </td>
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.email }}
                  </div>
                </td>
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.telegram }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="hero">
        <div
          class="hero-content text-center flex justify-center items-center h-80"
        >
          <div class="max-w-md">
            <h1 class="text-3xl font-bold">
              Здесь ничего нет <Icon name="fluent-emoji:thinking-face" />
            </h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
