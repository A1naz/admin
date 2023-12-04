<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Партнерская программа',
})

const selectedUser = ref<any>({
  username: '',
})
const curPage = ref(1)
const isPageBtnsDisabled = ref(false)
const { height, width } = useWindowSize()

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

function setTariffs() {
  if (selectedUser.value.tariffs) {
    console.log(selectedUser.value.tariffs)

    const userTariffs = selectedUser.value.tariffs

    Object.keys(userTariffs).forEach((tariffType) => {
      console.log(tariffType)

      if (tariffs.value[tariffType]) {
        tariffs.value[tariffType].value = userTariffs[tariffType].value
      }
    })
  }
}

async function saveTariffs() {
  const { data }: any = await useFetch('/api/tariff/save', {
  })
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
          <th>id пользователи</th>
          <th>комментарий</th>
          <th>Дата</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="hover">
          <td>
            <div class="mx-1 overflow-x-auto text-x"></div>
          </td>
          <td class="overflow-x-auto text-xs">
            <div class="mx-1 overflow-x-auto"></div>
          </td>
          <td class="overflow-x-auto text-xs">
            <div class="mx-1 overflow-x-auto"></div>
          </td>
          <td class="overflow-x-auto text-xs">
            <div class="mx-1 overflow-x-auto"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <dialog id="createRequireModal" class="modal">
    <div class="modal-box max-w-md">
      <h3 class="font-bold text-lg"></h3>
      <div class="flex flex-col">
        <div
          v-for="(tariff, tariffKey) in tariffs"
          class="flex justify-between"
        >
          <div class="mt-3">
            {{ tariffKey }}
          </div>
          <input
            type="text"
            v-model="tariffs[tariffKey].value"
            class="input input-bordered my-1"
          />
        </div>
      </div>
      <div class="flex justify-center">
        <button class="btn btn-primary mt-3 px-10" @click="saveTariffs">Сохранить</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button ref="closeCreateModalButton">close</button>
    </form>
  </dialog>
</template>
