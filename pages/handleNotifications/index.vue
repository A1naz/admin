<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Ручные уведомления',
})

const { height } = useWindowSize()

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('ручные уведомления')
) {
  navigateTo('/partner')
}

const dateRange = ref<any>([])
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))

const isCreateModalOpen = ref(false)
</script>
<template>
  <h1 class="text-2xl font-bold ml-3 my-2">{{ $route.meta.title }}</h1>
  <div class="flex pl-3">
    <DateRangePicker
      v-model="dateRange"
      :start-date="startDate"
      @reset="dateRange = []"
    >
      <button class="btn btn-neutral" >
        <Icon name="material-symbols:calendar-month-outline" size="26" />
      </button>
    </DateRangePicker>
    <button class="btn" @click="dateRange = []" v-if="dateRange.length">
      <Icon name="material-symbols:close" size="26" />
    </button>
    <button class="btn btn-square ml-2 max-w-xl w-xl" @click="isCreateModalOpen = true">
      <Icon name="fa6-solid:plus" size="20" />
    </button>
    <select class="select select-bordered w-50 ml-3">
      <option value="all">Все время</option>
      <option value="today">Сегодня</option>
      <option value="yesterday">Вчера</option>
      <option value="threeDaysAgo">3 дня</option>
      <option value="sevenDaysAgo">7 дней</option>
      <option value="30DaysAgo">30 дней</option>
    </select>
    <input
      class="input input-bordered w-50 ml-3"
      type="text"
      placeholder="название, текст"
    />
  </div>
  <div
    class="mt-6 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>Направление</th>
          <th>Создан</th>
          <th>Опубликован</th>
          <th>Заголовок</th>
          <th>Описание</th>
          <th>Редактировать</th>
          <th>Удалить</th>
          <th>Дублировать</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover">
          <th style="max-width: 80px; min-width: 70px"></th>
          <th style="max-width: 80px; min-width: 70px"></th>
        </tr>
      </tbody>
    </table>

    <HandleNotificationsCreateModal v-model:is-modal-open="isCreateModalOpen" />
  </div>
</template>
<style scoped>
::-webkit-scrollbar {
  height: 4px;
  width: 10px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 2px;
}
</style>
