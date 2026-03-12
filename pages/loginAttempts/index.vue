<script setup lang="ts">
const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('история входов')) {
  navigateTo('/partner')
}

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Попытки входа',
})

import { notify } from '@kyvg/vue3-notification'
const { height } = useWindowSize()
const { $dayjs } = useNuxtApp()

const elPerPage = 50
const curPage = ref(1)
const pages = ref(0)
const searchQuery = ref('')
const isPageBtnsDisabled = ref(false)
const dateSortIcon = ref('mdi-arrow-down')
const attempts = ref<any[]>([])
const attemptsCount = ref(0)

// Модалка подтверждения очистки
const clearModalRef: any = ref(null)
const closeClearModalRef: any = ref(null)
const identifierToClear = ref('')
const isClearing = ref(false)

async function fetchAttempts(page: number) {
  const data = await $fetch('/api/loginAttempts', {
    method: 'GET',
    params: {
      page,
      sortDate: dateSortIcon.value === 'mdi-arrow-up' ? 1 : -1,
      search: searchQuery.value || undefined,
    },
  })
  if (data) {
    attemptsCount.value = (data as any).count
    attempts.value = (data as any).attempts
    pages.value = Math.ceil(attemptsCount.value / elPerPage)
  }
}

async function getAttempts() {
  curPage.value = 1
  await fetchAttempts(curPage.value)
}

async function swapPage(destination: number) {
  if (destination < 0 && curPage.value <= 1) return
  if (curPage.value >= pages.value && destination > 0) {
    notify({ type: 'error', title: 'Последняя страница' })
    return
  }
  curPage.value += destination
  isPageBtnsDisabled.value = true
  await fetchAttempts(curPage.value)
  isPageBtnsDisabled.value = false
}

function sortByDate() {
  dateSortIcon.value = dateSortIcon.value === 'mdi-arrow-up' ? 'mdi-arrow-down' : 'mdi-arrow-up'
  getAttempts()
}

const getAttemptsDebounced = useDebounceFn(getAttempts, 500)
watch(searchQuery, () => getAttemptsDebounced())

function openClearModal(identifier: string) {
  identifierToClear.value = identifier
  clearModalRef.value?.showModal()
}

async function clearAttempts() {
  if (!identifierToClear.value) return

  isClearing.value = true
  try {
    const data = await $fetch('/api/loginAttempts/clear', {
      method: 'POST',
      body: { identifier: identifierToClear.value },
    })

    if ((data as any)?.success) {
      notify({ type: 'success', title: 'Попытки входа очищены' })
      closeClearModalRef.value?.click()
      identifierToClear.value = ''
      await getAttempts()
    }
  } catch (error: any) {
    notify({
      type: 'error',
      title: error?.data?.statusMessage || 'Ошибка при очистке',
    })
  }

  isClearing.value = false
}

getAttempts()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Попытки входа</h1>
    <div class="card p-fluid"></div>

    <div class="divider"></div>

    <div class="flex justify-between">
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по идентификатору"
          class="input input-bordered ml-2 w-80"
        />
      </div>
      <div class="join mr-2">
        <button
          class="join-item btn"
          @click="swapPage(-1)"
          :disabled="isPageBtnsDisabled"
        >
          «
        </button>
        <button class="join-item btn">{{ curPage }} из {{ pages }}</button>
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
      class="my-2 mx-2 overflow-y-auto"
      :style="{ 'max-height': height - 270 + 'px' }"
    >
      <table class="table table-pin-rows">
        <thead>
          <tr>
            <th>Идентификатор</th>
            <th>Успех</th>
            <th>
              <div @click="sortByDate" class="flex cursor-pointer select-none">
                Дата
                <Icon
                  class="swap-on fill-current ml-1 w-6 h-5"
                  :name="dateSortIcon"
                />
              </div>
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attempt in attempts" :key="attempt._id" class="hover">
            <td class="font-mono text-sm">{{ attempt.identifier }}</td>
            <td>
              <span
                class="badge"
                :class="attempt.success ? 'badge-success' : 'badge-error'"
              >
                {{ attempt.success ? 'Да' : 'Нет' }}
              </span>
            </td>
            <td class="text-sm">
              {{ $dayjs(attempt.createdAt).format('DD.MM.YYYY HH:mm:ss') }}
            </td>
            <td>
              <button
                class="btn btn-xs btn-error"
                @click="openClearModal(attempt.identifier)"
                title="Очистить все попытки этого идентификатора"
              >
                <Icon name="material-symbols:delete-outline" size="16" />
                Очистить попытки
              </button>
            </td>
          </tr>
          <tr v-if="attempts.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-400">
              Попытки входа не найдены
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Clear Confirmation Modal -->
    <dialog id="clearAttemptsModal" class="modal" ref="clearModalRef">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Подтверждение очистки</h3>
        <p class="mb-2">
          Вы уверены, что хотите очистить все попытки входа для:
        </p>
        <p class="font-mono font-bold text-base mb-4 break-all">
          {{ identifierToClear }}
        </p>
        <p class="text-sm text-warning mb-4">
          Будут удалены все записи этого идентификатора, а также все записи
          с его IP-адресами (включая анонимные попытки).
        </p>
        <div class="flex justify-end gap-2">
          <button
            class="btn btn-ghost"
            @click="closeClearModalRef?.click()"
            :disabled="isClearing"
          >
            Отмена
          </button>
          <button
            class="btn btn-error"
            @click="clearAttempts"
            :disabled="isClearing"
          >
            <span v-if="isClearing" class="loading loading-spinner"></span>
            <span v-else>Очистить</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button ref="closeClearModalRef">close</button>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
}
</style>
