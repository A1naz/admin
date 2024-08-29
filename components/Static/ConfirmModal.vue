<script setup lang="ts">
const route = useRoute()

defineProps({
  title: { type: String, required: false },
  subDescription: { type: String, required: false },
  description: { type: String, required: false },
  index: { type: Number, required: false },
  state: { type: Boolean, required: false, default: false },
  btnSaveLoading: { type: Boolean, required: false },
  saveError: { type: String, required: false },
  confirmFunction: {
    type: Function as PropType<() => Promise<void>>,
    default: async () => {},
    required: true,
  },
})

defineEmits(['click', 'update:state'])
</script>

<template>
  <div
    :class="{ 'modal-open': state }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div
      v-if="state"
      class="modal-box max-w-sm px-3 py-5 cursor-auto"
      @click.stop
    >
      <div class="">
        <div class="text-xl font-semibold text-center">
          {{ title }}
        </div>

        <div class="flex flex-col gap-2 my-2 justify-center text-center">
          {{ description }}
        </div>

        <div v-if="saveError">
          <p class="text-red-600">{{ saveError }}</p>
        </div>

        <div class="flex w-full justify-between">
          <Button
            class="btn w-[45%]"
            label="Отмена"
            @click="$emit('update:state', false)"
          >Отмена</Button>
          <Button
            class="btn btn-primary w-[45%]"
            label="Подтвердить"
            :loading="btnSaveLoading"
            @click=";[confirmFunction(), $emit('update:state', false)]"
          >
          Подтвердить
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
