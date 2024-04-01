<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Тарифы',
})

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('управление тарифами')
) {
  navigateTo('/partner')
}

const closeCreateModalButton = ref()
const standartTariffs = ref<any>([])
const userTariffs = ref<any>([])
const isSaveBtnDisabled = ref(false)

const selectedUser = ref<any>({
  username: '',
})

const mpStore = useMPStore()
const curPage = ref(1)
const isPageBtnsDisabled = ref(false)
const tariffsHistory = ref<any>([])
const { height, width } = useWindowSize()
const selectedMP = ref('wildberries')
const mps = mpStore.MPTabs

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
    case 'partnerRewardPercent':
      return 'Бонус партнерки %'
    case 'partnerSecondLevelPercent':
      return 'Бонус партнерки 2 уровня %'
    case 'HotelsBuyouts':
      return 'Бронирование отелей'
    case 'reviewRemoving':
      return 'Удаление отзывов'
    case 'Hotelsreview':
      return 'Отзывы отелей'
  }
}

function setTariffs() {
  if (selectedUser.value.uuid == 'all') {
    notify({
      title: 'Внимание',
      text: 'Выбраны все пользователи, будьте внимательны при изменении тарифов',
    })
  }

  const trueTariffs = standartTariffs.value
  trueTariffs.forEach((tariff: any) => {
    selectedUser.value.tariffs.forEach((userTariff: any) => {
      if (userTariff.mp === tariff.mp) {
        for (let key of Object.keys(tariff.prices)) {
          if (userTariff.prices[key]) {
            tariff.prices[key].value = userTariff.prices[key].value
            if (userTariff.prices[key].type) {
              tariff.prices[key].type = userTariff.prices[key].type
            }
            if (userTariff.prices[key].minPrice) {
              tariff.prices[key].minPrice = userTariff.prices[key].minPrice
            }
          }
        }
      }
    })
  })

  userTariffs.value = trueTariffs
}

async function saveTariffs() {
  isSaveBtnDisabled.value = true
  let errors = 0
  for (const mp of userTariffs.value) {
    for (let key of Object.keys(mp.prices)) {
      if (!mp.prices[key].value || mp.prices[key].value <= 0) {
        errors++
      }
    }
  }

  if (errors > 0) {
    notify({
      title: 'Внимание',
      text: 'Не все тарифы заполнены',
    })
    isSaveBtnDisabled.value = false
    return
  }
  const { data }: any = await useFetch('/api/tariff/save', {
    method: 'POST',
    body: {
      userUuid: selectedUser.value.uuid,
      tariffs: userTariffs.value,
    },
    watch: false,
  })
  if (data.value) {
    notify({
      type: 'success',
      title: 'Тарифы сохранены',
    })
    isSaveBtnDisabled.value = false
    closeCreateModalButton?.value?.click()
  } else {
    isSaveBtnDisabled.value = false
    notify({
      type: 'error',
      title: 'Произошла ошибка',
    })
  }
}

async function getStandartTariffs() {
  const { data }: any = await useFetch('/api/tariff/standart', {
    method: 'GET',
    watch: false,
  })
  standartTariffs.value = data.value
  userTariffs.value = standartTariffs.value
}
await getStandartTariffs()
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Управление тарифами</h1>
  <div class="divider"></div>
  <div class="flex w-full justify-between">
    <div>
      <selectUserModal
        @selectUser="selectedUser = $event"
        @selectAllUsers="selectedUser.username = 'all'"
      />
      <button
        class="btn btn-primary mr-3 ml-2"
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
        <tr class="hover" v-for="history in tariffsHistory" :key="history.id">
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
            <div class="mx-1 overflow-x-auto whitespace-pre-wrap">
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
    <div class="modal-box max-w-lg">
      <h3 class="font-bold text-lg">
        <div class="btm-nav absolute top-0.5 right-0">
          <button
            v-for="mp in mps"
            :key="mp.value"
            class="border-primary"
            :class="{
              active: selectedMP === mp.value,
            }"
            @click="selectedMP = mp.value"
          >
            {{ mp.title }}
          </button>
        </div>
      </h3>
      <div>
        <div class="flex flex-col">
          <div class="text-center mb-3 text-lg font-bold">
            {{
              selectedUser.username == 'all'
                ? 'Все пользователи'
                : selectedUser.username
            }}
          </div>
          <div v-for="mp in userTariffs" :key="mp.value">
            <div
              v-if="mp.mp === selectedMP"
              v-for="(tariff, tariffKey) in mp.prices"
              :key="tariffKey"
              class="flex justify-between"
            >
              <div class="mt-3">
                {{ getServiceNameByKey(tariffKey.toString()) }}
              </div>
              <div>
                <div
                  class="form-control"
                  v-if="tariffKey.toString() === 'buyouts'"
                >
                  <label class="label cursor-pointer mt-1">
                    Проценты
                    <input
                      type="checkbox"
                      class="toggle toggle-primary ml-1"
                      :checked="tariff.type === 'percent'"
                      @change="
                        tariff.type =
                          tariff.type === 'percent' ? 'price' : 'percent'
                      "
                    />
                  </label>
                </div>

                <input
                  type="number"
                  v-model="tariff.value"
                  class="input input-bordered my-1"
                />
                <div
                  v-if="tariffKey.toString() === 'buyouts'"
                  class="flex flex-col"
                >
                  Минимальное значение в ₽
                  <input
                    type="number"
                    placeholder="Мин. значение в ₽"
                    v-model="tariff.minPrice"
                    class="input input-bordered my-1"
                  />
                </div>
              </div>
            </div>
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
        <button
          class="btn btn-primary mt-3 px-10"
          :disabled="isSaveBtnDisabled"
          @click="saveTariffs"
        >
          Сохранить
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button ref="closeCreateModalButton">close</button>
    </form>
  </dialog>
</template>
