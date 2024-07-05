<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const { upload, getPublicUrl } = useS3Object()

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedTariff: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(['update:isModalOpen'])

const close = () => {
  emit('update:isModalOpen', false)
}

async function save() {
  const { data }: any = await useFetch('/api/tariffPlans/edit', {
    method: 'POST',
    body: {
      uuid: props.selectedTariff.uuid,
      status: props.selectedTariff.status,
    },
  })
  if (data.value) {
    notify({
      text: 'Тариф успешно изменен',
      type: 'success',
    })
    close()
  }
}
</script>
<template>
  <div
    id="editTariffModal"
    class="modal z-40 cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="close"
  >
    <div class="modal-box w-9/12 max-w-[500px] cursor-auto" @click.stop>
      <form method="dialog" class="flex justify-between">
        <label
          for="editTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div class="mt-1 ml-2 text-xl">Контакты</div>
      <div class="mt-1 ml-1">
        Наименование организации
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedTariff.userOrgName"
        />
      </div>

      <select
        v-model="selectedTariff.status"
        class="select select-bordered w-full my-2 ml-1"
      >
        <option disabled selected>Выберите тип тарифа</option>
        <option value="На рассмотрении">На рассмотрении</option>
        <option value="Активен">Активен</option>
        <option value="Завершен">Завершен</option>
        <option value="В архиве">В архиве</option>
      </select>
      <div class="w-full flex justify-center">
        <button class="btn btn-primary ml-1 mt-3 w-[60%]" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>
