<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('управление тарифами')
) {
  navigateTo('/partner')
}

const selectedUser = ref<any>({
  username: '',
})
const curPage = ref(1)
const isPageBtnsDisabled = ref(false)
const tariffsHistory = ref<any>([])
const { height, width } = useWindowSize()

async function getTariffHistory() {
  const { data } = await useFetch('/api/tariff/getTariffChangeHistory', {
    method: 'GET',
    params: {
      page: curPage.value,
    },
  })
  if (data.value) {
    tariffsHistory.value = data.value
  }
}
await getTariffHistory()

async function swapPage(destination: number) {
  if (destination < 0 && curPage.value <= 1) return

  curPage.value += destination
  isPageBtnsDisabled.value = true
  // await getRefStats()
  isPageBtnsDisabled.value = false
}

const tariffs = ref<any>({
  buyouts: {
    type: 'price',
    value: 100,
  },
  deliveryStorage: {
    type: 'price',
    value: 25,
  },
  review: {
    type: 'price',
    value: 40,
  },
  likeReview: {
    type: 'price',
    value: 5,
  },
  likeProduct: {
    type: 'price',
    value: 5,
  },
  questionProduct: {
    type: 'price',
    value: 7,
  },
  cart: {
    type: 'price',
    value: 5,
  },
  autoAnswer: {
    type: 'price',
    value: 100,
  },
})

function getServiceNameByKey(key: string) {
  switch (key) {
    case 'buyouts':
      return 'Выкупы'
    case 'deliveryStorage':
      return 'Доставки'
    case 'review':
      return 'Отзывы'
    case 'likeReview':
      return 'Лайки отзывов'
    case 'likeProduct':
      return 'Лайки продуктов'
    case 'questionProduct':
      return 'Вопросы продуктов'
    case 'cart':
      return 'Корзина'
    case 'autoAnswer':
      return 'Автоответчик'
  }
}

function setTariffs() {
  if (selectedUser.value.tariffs) {
    const userTariffs = selectedUser.value.tariffs

    Object.keys(userTariffs).forEach((tariffType) => {
      if (tariffs.value[tariffType]) {
        tariffs.value[tariffType].value = userTariffs[tariffType].value
        tariffs.value[tariffType].type = userTariffs[tariffType].type
      }
    })
  }

  if (selectedUser.value.uuid == 'all') {
    notify({
      title: 'Внимание',
      text: 'Выбраны все пользователи, будьте внимательны при изменении тарифов',
    })
  }
}

async function saveTariffs() {
  for (const tariffKey in tariffs.value) {
    if (
      tariffs.value[tariffKey].value <= 0 ||
      tariffs.value[tariffKey].value >= 99999
    ) {
      notify({
        type: 'error',
        title: 'Введите корректные значения тарифов',
      })
      return
    }
  }

  const { data }: any = await useFetch('/api/tariff/save', {
    method: 'POST',
    body: {
      userUuid: selectedUser.value.uuid,
      tariffs: tariffs.value,
    },
    watch: false,
  })
  if (data.value) {
    notify({
      type: 'success',
      title: 'Тарифы сохранены',
    })
    location.reload()
  } else {
    notify({
      type: 'error',
      title: 'Произошла ошибка',
    })
  }
}

function changeServiceType(key: string, event: Event) {
  if ((event.target as HTMLInputElement).checked) {
    tariffs.value[key].type = 'percent'
  } else {
    tariffs.value[key].type = 'price'
  }
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Партнерская программа</h1>
  <div class="text-sm breadcrumbs ml-5">
    <ul>
      <li>
        <NuxtLink to="/tariff">Управление тарифами</NuxtLink>
      </li>
    </ul>
  </div>
  <div class="divider"></div>
  <div class="flex w-full justify-between">
    <div>
      <selectUserModal
        @selectUser="selectedUser = $event"
        :selectAll="true"
        @selectAllUsers="selectedUser.username = 'all'"
      />
      <button
        class="btn btn-primary mr-3"
        @click="setTariffs"
        onclick="createRequireModal.showModal()"
        :disabled="selectedUser.username == ''"
      >
        Редактировать тарифы
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
          <th>id админа</th>
          <th>id пользователя</th>
          <th>username пользователя</th>
          <th>комментарий</th>
          <th>Дата</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover" v-for="history in tariffsHistory">
          <td class="overflow-x-auto text-xs" style="max-width: 150px">
            <div class="mx-1 overflow-x-auto text-x">
              {{ history.adminUserUuid }}
            </div>
          </td>
          <td class="overflow-x-auto text-xs" style="max-width: 150px">
            <div class="mx-1 overflow-x-auto">
              {{ history.userUuid }}
            </div>
          </td>
          <td class="overflow-x-auto text-xs">
            <div class="mx-1 overflow-x-auto">
              {{ history.username }}
            </div>
          </td>
          <td class="overflow-x-auto text-xs">
            <div class="mx-1 overflow-x-auto">
              {{ history.actionDescription }}
            </div>
          </td>
          <td class="overflow-x-auto text-xs">
            <div class="mx-1 overflow-x-auto">
              {{ history.date.substring(0, 10) }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <dialog id="createRequireModal" class="modal">
    <div class="modal-box max-w-md">
      <h3 class="font-bold text-lg"></h3>
      <div class="flex flex-col">
        <div class="text-center mb-3 text-lg font-bold">
          {{
            selectedUser.username == 'all'
              ? 'Все пользователи'
              : selectedUser.username
          }}
        </div>

        <div
          v-for="(tariff, tariffKey) in tariffs"
          class="flex justify-between"
        >
          <div class="mt-3">
            {{ getServiceNameByKey(tariffKey.toString()) }}
          </div>
          <div>
            <div class="form-control" v-if="tariffKey.toString() === 'buyouts'">
              <label class="label cursor-pointer mt-1">
                Проценты
                <input
                  type="checkbox"
                  class="toggle toggle-primary ml-1"
                  :checked="tariffs[tariffKey].type === 'percent'"
                  @change="changeServiceType(tariffKey.toString(), $event)"
                />
              </label>
            </div>
            <input
              type="number"
              v-model="tariffs[tariffKey].value"
              class="input input-bordered my-1"
            />
          </div>
        </div>
      </div>
      <div
        v-if="selectedUser.uuid === 'all'"
        class="text-center text-lg font-extrabold text-warning"
      >
        Выбраны все пользователи!
      </div>
      <div class="flex justify-center">
        <button class="btn btn-primary mt-3 px-10" @click="saveTariffs">
          Сохранить
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button ref="closeCreateModalButton">close</button>
    </form>
  </dialog>
</template>
