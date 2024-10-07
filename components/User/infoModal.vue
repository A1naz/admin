<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false,
  },
  selectedUser: {
    type: Object,
    default: () => {},
  },
  status: {
    type: String,
    default: 'accepted',
  },
})

const emit = defineEmits(['update:isModalOpen'])

const close = () => {
  emit('update:isModalOpen', false)
}

function copyUserDataToClipboard() {
  const userValues = Object.values(props.selectedUser)
    .filter((value) => value !== null && value !== undefined && value !== '')
    .join('\n')
  navigator.clipboard.writeText(userValues)

  notify({
    type: 'success',
    title: 'Данные скопированы в буфер обмена',
  })
}
</script>
<template>
  <div
    id="adjustTariffModal"
    class="modal z-40 cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="close"
  >
    <div class="modal-box w-9/12 max-w-[500px] cursor-auto" @click.stop>
      <form method="dialog" class="flex justify-between">
        <label
          for="adjustTariffModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </label>
      </form>
      <div class="flex flex-wrap">
        <div class="mt-1 ml-2 text-xl">Данные об организации</div>
        <button
          class="btn btn-primary btn-sm ml-3 my-2"
          @click="copyUserDataToClipboard"
        >
          Скопировать данные
        </button>
      </div>
      <div class="mt-1 ml-2">
        Телефон аккаунта
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.phone"
        />
      </div>
      <div class="mt-1 ml-2">
        E-mail аккаунта
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.email"
        />
      </div>
      <div class="mt-1 ml-2">
        Наименование организации
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.orgName"
        />
      </div>
      <div class="mt-1 ml-2">
        ИНН
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.INN"
        />
      </div>
      <div class="mt-1 ml-2">
        ОГРН
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.orgOgrn"
        />
      </div>
      <div class="mt-1 ml-2">
        Юр. адрес
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.address"
        />
      </div>
      <div class="mt-1 ml-2">
        Наименование организации
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.orgName"
        />
      </div>
      <div class="mt-1 ml-2">
        Наименование организации
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.orgName"
        />
      </div>
      <div class="mt-1 ml-2">
        Расчётный счет
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.rs"
        />
      </div>
      <div class="mt-1 ml-2">
        БИК
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.bik"
        />
      </div>
      <div class="mt-1 ml-2">
        Корреспондентский счёт
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.ks"
        />
      </div>
      <div class="mt-1 ml-2">
        Наименование банка
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.bankName"
        />
      </div>
      <div class="mt-1 ml-2">
        Телефон организации
        <input
          type="text"
          class="input input-bordered w-full mt-1"
          disabled
          v-model="selectedUser.orgPhone"
        />
      </div>
    </div>
  </div>
</template>
