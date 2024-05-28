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
const emit = defineEmits(['useTemplate', 'deleteTemplate'])
</script>
<template>
  <button class="btn btn-primary mx-1 ml-2" @click="isModalOpen = true">
    Шаблоны пвз
  </button>
  <!-- <div

    :class="{ 'modal-open': state }" 
    class="modal"
  > -->
  <div
    id="selectUsers"
    class="modal cursor-pointer overflow-y-auto"
    :class="{ 'modal-open': isModalOpen }"
    @click="isModalOpen = false"
  >
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
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
        class="collapse collapse-arrow border border-base-100 bg-base-200 rounded-box z-0 overflow-hidden mt-2"
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
              @click="$emit('deleteTemplate', templates[index].uuid)"
              >Удалить</label
            >
            <label
              @click="$emit('useTemplate', info.pvzs)"
              class="btn btn-sm btn-primary truncate mr-1 bg-opacity-20 border-none text-base-content"
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
                <th>Адрес</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="hover"
                v-for="pvz in info.pvzs"
                :key="pvz.uuid"
              >
                <td style="max-width: 150px">
                  <div class="mx-1 overflow-x-auto">
                    {{ pvz.address }}
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
