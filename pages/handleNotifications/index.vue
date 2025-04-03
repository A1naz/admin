<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Ручные уведомления',
})

import { notify } from '@kyvg/vue3-notification'
const { height } = useWindowSize()
const curPage = ref(1)
const pages = ref(1000)
const confirmModal = ref(false)

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('ручные уведомления')
) {
  navigateTo('/partner')
}

const dateRange = ref('all')
const searchQuery = ref('')

const isCreateModalOpen = ref(false)

const notifications = ref<any>([])
async function getNotifications() {
  const { data, error }: any = await useFetch('/api/notifications/get', {
    method: 'GET',
    query: {
      dateRange: dateRange.value,
      searchQuery: searchQuery.value,
      page: curPage.value,
    },
    watch: false,
  })
  if (data.value) {
    notifications.value = data.value
  }
  if (error.value) {
    notifications.value = []
    notify({
      type: 'error',
      title: 'Не удалось получить уведомления',
    })
  }
}
getNotifications()

const selectedNotification = ref<any>({
  text: '',
  category: '',
  activationDate: new Date(Date.now() + 1000 * 60 * 5),
})
const editModal = ref(false)
function openEditModal(notification: any) {
  selectedNotification.value = notification
  console.log(notification)
  editModal.value = true
}

const isPageBtnsDisabled = ref(false)
async function swapPage(destination: number) {
  if (destination < 0 && curPage.value <= 1) return
  if (curPage.value >= pages.value && destination > 0) {
    notify({
      type: 'error',
      title: 'Последняя страница',
    })
    return
  }
  curPage.value += destination
  isPageBtnsDisabled.value = true
  await getNotifications()
  isPageBtnsDisabled.value = false
}

async function deleteNotification() {
  const { data, error }: any = await useFetch('/api/notifications/delete', {
    method: 'POST',
    body: selectedNotification,
    watch: false,
  })

  getNotifications()
}


function openConfirmModal(notification: any) {
  selectedNotification.value = notification
  confirmModal.value = true
}

const findDebounced = useDebounceFn(getNotifications, 300)
watch(searchQuery, findDebounced)
watch(dateRange, findDebounced)
</script>
<template>
  <h1 class="text-2xl font-bold ml-3 my-2">{{ $route.meta.title }}</h1>
  <div class="flex pl-3">
    <button
      class="btn btn-square ml-2 max-w-xl w-xl"
      @click="isCreateModalOpen = true"
    >
      <Icon name="fa6-solid:plus" size="20" />
    </button>
    <select class="select select-bordered w-50 ml-3" v-model="dateRange">
      <option value="all">Все время</option>
      <option value="today">Сегодня</option>
      <option value="yesterday">Вчера</option>
      <option value="threeDaysAgo">3 дня</option>
      <option value="sevenDaysAgo">7 дней</option>
      <option value="30DaysAgo">30 дней</option>
    </select>
    <input
      v-model="searchQuery"
      class="input input-bordered w-50 ml-3 mr-2"
      type="text"
      placeholder="название, текст"
    />
    <div class="join mr-2">
      <button
        class="join-item btn"
        @click="swapPage(-1)"
        :disabled="isPageBtnsDisabled"
      >
        «
      </button>
      <button class="join-item btn">{{ curPage }}</button>
      <button
        class="join-item btn"
        @click="swapPage(1)"
        :disabled="isPageBtnsDisabled"
      >
        »
      </button>
    </div>
  </div>
  <div
    class="mt-6 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>Создан</th>
          <th>Опубликован</th>
          <th>Заголовок</th>
          <th>Описание</th>
          <th>Редактировать</th>
          <th>Удалить</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover" v-for="notification in notifications">
          <th style="max-width: 95px; min-width: 90px" class="text-xs">
            {{
              notification.date
                ? $dayjs(notification.date).format('DD.MM.YYYY')
                : '-'
            }}
          </th>
          <th style="max-width: 95px; min-width: 90px" class="text-xs">
            {{
              notification.activationDate
                ? $dayjs(notification.activationDate).format('DD.MM.YYYY')
                : '-'
            }}
          </th>
          <th style="max-width: 100px; min-width: 50px">
            {{ notification.category }}
          </th>
          <th style="min-width: 250px" class="text-wrap text-xs">
            {{ notification.text }}
          </th>
          <th style="width: 10px" @click="openEditModal(notification)">
            <button class="btn btn-square btn-neutral">
              <Icon name="material-symbols:edit" size="20" />
            </button>
          </th>
          <th style="width: 10px" @click="openConfirmModal(notification)">
            <button class="btn btn-square btn-neutral mr-6">
              <Icon name="material-symbols:delete" size="20" />
            </button>
          </th>
        </tr>
      </tbody>
    </table>

    <HandleNotificationsEdit
      v-model:state="editModal"
      :selectedNotification="selectedNotification"
    />
    <HandleNotificationsCreateModal v-model:is-modal-open="isCreateModalOpen" />
    <StaticConfirmModal
      :title="'Подтвердить действие'"
      :description="'Вы уверены, что хотите удалить уведомление?'"
      :confirmFunction="deleteNotification"
      v-model:state="confirmModal"
    />
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
