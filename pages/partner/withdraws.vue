<script setup lang="ts">
import Paginator from 'primevue/paginator'
import { notify } from '@kyvg/vue3-notification'

const partnerStore = usePartnerStore()
const { height, width } = useWindowSize()
const withdraws = ref<any>([])
const withdrawsCount = ref(0)
const elPerPage = 25
const pages = ref(0)
const inputLoading = ref(false)
const curPage = ref(1)
const isPageBtnsDisabled = ref(false)
const query = ref('')
const sumFrom = ref('')
const sumTo = ref('')
const dateSortIcon = ref('mdi-arrow-down')

const status = ref('any')
const type = ref('any')

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

async function getWithdraws(searchValue: string = '') {
  if (searchValue.length > 1) {
    curPage.value = 1
  }
  const { data }: any = await useFetch('/api/partner/getWithdrawsWIthFilters', {
    method: 'GET',
    params: {
      page: curPage.value,
      searchValue,
      filters: {
        status: status.value,
        type: type.value,
        sumFrom,
        sumTo,
      },
      sort: {
        date: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      },
    },
  })

  withdrawsCount.value = data.value.withdrawsCount
  withdraws.value = data.value.withdraws
  pages.value = Math.ceil(withdrawsCount.value / elPerPage)
}

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getWithdraws()
}

await getWithdraws()

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
  await getWithdraws()
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
  await getWithdraws(query.value)
  inputLoading.value = false
}
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)
</script>

<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Партнерская программа</h1>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li><NuxtLink to="/partner">Партнерская программа</NuxtLink></li>
      <li>
        <NuxtLink to="/partner/withdraws">Выплаты</NuxtLink>
      </li>
    </ul>
  </div>
  <PartnerDivider />
  <div class="divider"></div>
  <div class="flex w-full justify-between">
    <div class="flex">
      <div>
        <label
          ><input
            v-model="query"
            type="text"
            placeholder="Поиск "
            class="input input-bordered input-l ml-4"
            @input="onInput($event)"
          />
        </label>
        <span
          v-if="inputLoading"
          class="loading loading-spinner text-primary loading-large ml-4"
        />
      </div>

      <select
        class="select select-bordered w-36 ml-4"
        @change="getWithdraws(query)"
        v-model="status"
      >
        <option selected value="any">статус</option>
        <option value="created">создан</option>
        <option value="work">в процессе</option>
        <option value="canceled">отменен</option>
        <option value="closed">закрыт</option>
      </select>
      <select
        class="select select-bordered w-36 ml-4"
        @change="getWithdraws(query)"
        v-model="type"
      >
        <option selected value="any">тип</option>
        <option value="account">аккаунт</option>
        <option value="card">карта</option>
      </select>

      <label
        ><input
          v-model="sumFrom"
          type="number"
          @keyup.enter="getWithdraws(query)"
          placeholder="сумма от "
          class="input input-bordered input-l ml-4 w-28"
        />
      </label>
      <label
        ><input
          v-model="sumTo"
          type="number"
          @keyup.enter="getWithdraws(query)"
          placeholder="сумма до "
          class="input input-bordered input-l ml-4 w-28"
        />
      </label>
      <button
        class="btn btn-sm btn-primary ml-2 mt-2"
        @click="getWithdraws(query)"
      >
        Применить
      </button>
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
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>ID</th>
          <th>userId</th>
          <th>ФИО</th>
          <th>Тип</th>
          <th>Карта</th>
          <th>Статус</th>
          <th>Сумма</th>
          <th>
            <div @click="sortByDate" class="flex cursor-pointer">
              Дата изменения
              <Icon
                class="swap-on fill-current ml-1 w-6 h-5"
                :name="dateSortIcon"
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="withdraw in withdraws" class="hover">
          <th style="max-width: 120px; min-width: 110px">
            {{ withdraw._id }}
          </th>
          <th
            style="max-width: 145px; min-width: 140px"
            class="overflow-x-auto"
          >
            {{ withdraw.userUuid }}
          </th>
          <th
            style="max-width: 145px; min-width: 140px"
            class="overflow-x-auto"
          >
            {{ withdraw.details.fio }}
          </th>
          <th style="max-width: 40px; min-width: 35px" class="overflow-x-auto">
            {{ withdraw.type == 'card' ? 'карта' : 'аккаунт' }}
          </th>
          <th style="width: 190px" class="overflow-x-auto">
            {{ withdraw.details.card }}
          </th>
          <th style="max-width: 80px; min-width: 75px" class="overflow-x-auto">
            {{
              withdraw.status == 'created'
                ? 'создан'
                : withdraw.status == 'work'
                ? 'в процессе'
                : withdraw.status == 'completed'
                ? 'завершен'
                : withdraw.status == 'закрыт'
                ? 'закрыт'
                : withdraw.status == 'cancelled'
                ? 'отменен'
                : 'ошибка'
            }}
          </th>
          <th class="overflow-x-auto">{{ withdraw.amount }} ₽</th>
          <th style="max-width: 45px; min-width: 40px" class="overflow-x-auto">
            {{ withdraw.date.slice(0, 10) }}
          </th>
        </tr>
      </tbody>
    </table>
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
