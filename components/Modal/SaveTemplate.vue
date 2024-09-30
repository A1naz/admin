<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
  },
})

const isModalOpen = ref(false)
const templateName = ref('')
const emit = defineEmits(['save', 'isModalTemplateOpen'])
const loading = toRef(props, 'loading')
function save() {
  emit('save', templateName.value)
  watch(loading, (newValue) => {
    if (newValue === false) {
      isModalOpen.value = false
      templateName.value = ''
    }
  })
}

watch(isModalOpen, (newValue) => {
  emit('isModalTemplateOpen', isModalOpen.value)
})

defineExpose({
  isModalOpen,
})
</script>
<template>
  <button
    :disabled="disabled"
    class="btn btn-primary btn-sm mx-1 h-[2.5rem] mt-5"
    @click="isModalOpen = true"
  >
    Создать шаблон
  </button>
  <!-- <div

    :class="{ 'modal-open': state }" 
    class="modal"
  > -->
  <div
    id="selectUsers"
    class="modal overflow-y-auto cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="isModalOpen = false"
  >
    <div class="modal-box w-9/12 max-w-md cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectUsers"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="isModalOpen = false"
        >
          ✕
        </label>
      </form>
      <div>
        <h3 class="font-semibold text-lg text-bas mr-4">
          Введите название шаблона
        </h3>
        <input
          v-model="templateName"
          type="text"
          @keyup.enter=";[save(), (isModalOpen = false)]"
          placeholder="Название шаблона"
          class="input input-bordered w-full mt-2 bg-base-200 placeholder-base-content placeholder-opacity-50 border-base-200"
        />
        <div class="modal-action flex self-end">
          <label
            for="template-modal"
            class="btn btn-ghost my-2 md:my-0 w-[30%]"
            @click="isModalOpen = false"
            >Отмена</label
          >

          <button
            class="btn btn-primary w-[30%]"
            @click=";[save(), (isModalOpen = false)]"
            :disabled="loading || templateName === ''"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
