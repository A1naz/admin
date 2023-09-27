<script setup lang="ts">
import Paginator from 'primevue/paginator'
import { notify } from '@kyvg/vue3-notification'

const { height, width } = useWindowSize()
const users = ref<any>([])
const usersCount = ref(0)
const elPerPage = 25
const pages = ref(0)
const inputLoading = ref(false)
const curPage = ref(1)
const isPageBtnsDisabled = ref(false)
const query = ref('')
const selectedUser = ref({})
const referralModalLoading = ref(false)

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

async function getUsers(searchValue: string = '') {
  const { data }: any = await useFetch('/api/user/getUsers', {
    method: 'GET',
    params: {
      page: curPage.value,
      searchValue,
    },
  })

  usersCount.value = data.value.usersCount
  users.value = data.value.users
  pages.value = Math.ceil(usersCount.value / elPerPage)
}

await getUsers()

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
  await getUsers()
  isPageBtnsDisabled.value = false
}
async function onInput(event: Event) {
  findSearchQueryDebounced()
}

const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '' && query.value.length > 0) {
    return
  }
  inputLoading.value = true
  await getUsers(query.value)
  inputLoading.value = false
}
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

function openReferralModal(user: any) {
  selectedUser.value = user
  referralModalLoading.value = true
}
</script>

<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Управление партнерами</h1>
  <PartnerDivider />
  <div class="divider"></div>
  <div class="flex w-full justify-between">
    <div>
      <label tabindex="10"
        ><input
          v-model="query"
          type="text"
          placeholder="Поиск"
          class="input input-bordered input-l ml-4"
          @input="onInput($event)"
        />
      </label>
      <span
        v-if="inputLoading"
        class="loading loading-spinner text-primary loading-large ml-4"
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
    class="my-2 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 250 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>id</th>
          <th>username</th>
          <th>email</th>
          <th>Управление</th>
          <th>Настройки</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="user in users" class="hover">
          <th style="max-width: 300px">
            <div class="py-2 overflow-x-auto text-xs">
              {{ user.uuid }}
            </div>
          </th>
          <th style="max-width: 300px">
            <div class="py-2 overflow-x-auto">
              {{ user.username }}
            </div>
          </th>
          <th style="max-width: 300px">
            <div class="py-2 overflow-x-auto">
              {{ user.email }}
            </div>
          </th>
          <th style="width: 190px">
            <label
              for="referral_modal"
              class="btn btn-primary btn-sm"
              @click="openReferralModal(user)"
              >Добавить реферала</label
            >
          </th>
          <th style="width: 140px;">
            <label for="" class="btn btn-primary btn-sm" @click=""
              >Настройки</label
            >
          </th>
        </tr>
      </tbody>
    </table>
  </div>

  <PartnerReferralModal :user="selectedUser" :loading="referralModalLoading" />
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
