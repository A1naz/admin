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
  status: {
    type: String,
    default: 'accepted',
  },
  getTariffs: {
    type: Function,
    default: () => {},
  },
})

const emit = defineEmits(['update:isModalOpen'])

const close = () => {
  emit('update:isModalOpen', false)
}

async function save() {
  const { data }: any = await useFetch('/api/tariffPayments/edit', {
    method: 'POST',
    body: {
      uuid: props.selectedTariff.uuid,
      status: props.status,
    },
  })
  if (data.value) {
    notify({
      text: 'Тариф успешно изменен',
      type: 'success',
    })
    props.getTariffs()
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
      <div class="mt-1 ml-1 text-center">
        Наименование организации
        <input
          type="text"
          class="input input-bordered w-full mt-1 text-center"
          disabled
          v-model="selectedTariff.orgName"
        />
      </div>

      <div class="text-lg text-center my-3">
        {{
          status == 'accepted'
            ? 'Вы действительно хотите утвердить оплату?'
            : 'Вы действительно хотите отменить оплату?'
        }}
      </div>

      <div class="w-full flex justify-between">
        <button class="btn ml-1 mt-3 w-[47%]" @click="close">Отмена</button>
        <button class="btn btn-primary ml-1 mt-3 w-[47%]" @click="save">
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>
