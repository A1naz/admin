import { onMounted } from 'vue';
<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },

})
const emit = defineEmits(['close', 'create'])
const store = useBuyoutStore()
const message = ref('')
const loading = ref(false)
const success = ref(false)
async function checkBuyouts() {
  loading.value = true
  const { data, error } = await useFetch('/api/buyout/checkRules', {
    method: 'POST',
    body: JSON.stringify(store.createProducts),
  })
  if (error.value) {
    success.value = false
    message.value = 'Произошла ошибка при проверке'
  }
  if (data.value) {
    if (data.value.success)
      success.value = true

    message.value = data.value.message
  }
  loading.value = false
}
onMounted(async () => {
  checkBuyouts()
})
</script>

<template>
  <div
    id="buyoutChecksModal" :class="{
      'modal-open': state,
    }" class="modal"
  >
    <div class="modal-box">
      <h3 class="font-bold text-lg">
        Проверяем выкупы по правилам
      </h3>
      <span
        v-if="!loading"
        :class="{
          'text-error': !success,
          'text-success': success,
        }" class="text-lg"
      >{{ success ? 'Успешно' : 'Ошибка' }}</span>
      <div class="flex justify-center mt-6">
        <span v-if="loading" class="loading loading-spinner loading-lg" />
        <span v-else>{{ message }}</span>
      </div>
      <div class="modal-action">
        <button v-if="!loading" class="btn btn-sm" @click="emit('close')">
          Закрыть
        </button>
        <button v-if="success" class="btn btn-sm btn-primary" @click="emit('create')">
          Создать
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
