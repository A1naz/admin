<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Пользователи и права',
})

const allowedUsersModalRef = ref<any>()
const restrictedUsersModalRef = ref<any>()
const userEditForm = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  roles: <any>['user'],
  tabs: <any>[],
  allowedUsers: <any>[],
  restrictedUsers: <any>[],
})
const roles = ref<any>([
  {
    value: 'user',
    text: 'Пользователь',
    disabled: true,
  },
  {
    value: 'manager',
    text: 'Менеджер',
  },
  {
    value: 'accountant',
    text: 'Бухгалтер',
  },
  {
    value: 'investor current account',
    text: 'Инвестор расчетный счет',
  },
  {
    value: 'project manager',
    text: 'Проджект менеджер',
  },
  {
    value: 'ceo',
    text: 'CEO',
  },
  {
    value: 'financier',
    text: 'Финансист',
  },
  {
    value: 'marketolog',
    text: 'Маркетолог',
  },
  {
    value: 'assistant',
    text: 'Ассистент',
  },
  {
    value: 'hr',
    text: 'HR',
  },
  {
    value: 'organazer',
    text: 'Органайзер',
  },
  {
    value: 'jurist',
    text: 'Юрист',
  },
  {
    value: 'smm',
    text: 'SMM',
  },
  {
    value: 'targetolog',
    text: 'Таргетолог',
  },
  {
    value: 'tech support',
    text: 'Тех.поддержка (Менеджер)',
  },
  {
    value: 'investor qiwi',
    text: 'Инвестор Qiwi',
  },
])
const password = ref('')
const repeatPassword = ref('')

const isSelectedUserAdmin = computed(() => {
  return userEditForm.value.roles.length > 1
})

const selectedUserRole = ref('manager')
import { notify } from '@kyvg/vue3-notification'
const { height, width } = useWindowSize()
const dateSortIcon = ref('mdi-arrow-down')
const elPerPage = 50
const inputLoading = ref(false)
const curPage = ref(1)
const pages = ref(0)
const query = ref('')
const isPageBtnsDisabled = ref(false)
const users = ref<any>([])
const usersCount = ref(0)
const selectAdminUserClose: any = ref(null)
const dateRange = ref([])
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const selectedUser: any = ref({
  username: '',
})

async function getUsers() {
  const { data, error }: any = await useFetch('/api/user/getUsers', {
    method: 'GET',
    watch: false,
    params: {
      page: curPage.value,
      sortDate: dateSortIcon.value,
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
      searchValue: query.value,
      role: selectedUserRole.value,
    },
  })
  if (data.value) {
    usersCount.value = data.value.count
    users.value = data.value.users
    pages.value = Math.ceil(usersCount.value / elPerPage)
  }
}

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
  users.value = []
  await getUsers()
  isPageBtnsDisabled.value = false
}

const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  curPage.value = 1
  await getUsers()
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

async function getAllowedUsers() {
  const { data, error }: any = await useFetch('/api/manager/getAllowedUsers', {
    method: 'GET',
    watch: false,
    params: {
      uuid: selectedUser.value.uuid,
    },
  })

  if (data.value) {
    userEditForm.value.allowedUsers = data.value.allowedUsers.map(
      (user: any) => user._id
    )
    userEditForm.value.restrictedUsers = data.value.restrictedUsers.map(
      (user: any) => user._id
    )
    allowedUsersModalRef.value?.setUsers(data.value.allowedUsers)
    restrictedUsersModalRef.value?.setUsers(data.value.restrictedUsers)
  }
}

async function selectUser(user: any) {
  selectedUser.value = user
  userEditForm.value.email = user.email
  userEditForm.value.firstName = user.firstName
  userEditForm.value.lastName = user.lastName
  userEditForm.value.username = user.username
  userEditForm.value.roles = user.roles
  userEditForm.value.tabs = []
  selectAdminUserClose.value?.click()

  if (isSelectedUserAdmin.value === true) {
    const { data, error } = await useFetch('/api/manager/getTabs', {
      method: 'GET',
      watch: false,
      params: {
        uuid: selectedUser.value.uuid,
      },
    })

    if (data.value) {
      userEditForm.value.tabs = data.value.tabs
    }
    await getAllowedUsers()
  }
}

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getUsers()
}
getUsers()

const value = ref()
const options = ref()

const editUsersModalClose: any = ref(null)
function openEditUsersModal() {
  editUsersModalClose.value?.click()
}

const tabs = ref<any>([
  'история действий',
  'финансовые операции',
  'управление средствами',
  'управление кошельками',
  'управление аккаунтами',
  'управление партнеркой',
  'управление выкупами',
  'управление пользователями платформы',
  'аналитика',
  'запросы скриншотов',
  'ошибки финансовых операции',
  'переводы с аккаунта на аккаунт',
  'возвраты средств клиентам',
])

async function saveUser() {
  const body: any = userEditForm.value

  if (createMode.value == true || password.value.length > 0) {
    if (password.value != repeatPassword.value) {
      notify({
        type: 'error',
        title: 'Пароли не совпадают',
      })
      return
    }

    if (password.value.length < 8) {
      notify({
        type: 'error',
        title: 'Пароль слишком короткий',
      })
      return
    }

    body.password = password.value
  }
  body.email = body.email.replaceAll(' ', '')

  const { data, error }: any = await useFetch('/api/manager/saveUser', {
    method: 'GET',
    watch: false,
    params: {
      uuid: selectedUser.value.uuid,
      strBody: body,
    },
  })

  if (data.value) {
    notify({
      type: 'success',
      title: 'Успешно',
    })
    location.reload()
  }

  if (error.value) {
    notify({
      type: 'error',
      title: 'Произошла ошибка',
    })

  }
}

const createMode = ref(false)
const store = useMainStore()
if (!store.client.mainAdmin) {
  navigateTo('/partner')
}
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">Пользователи и права</h1>
    <div class="card p-fluid"></div>
    <div class="text-sm breadcrumbs ml-5">
      <ul>
        <li>
          <NuxtLink to="/users">Пользователи и права</NuxtLink>
        </li>
        <!-- <li>
                    <NuxtLink to="/partner/management">Управление партнерами</NuxtLink>
                </li> -->
      </ul>
    </div>
    <div class="divider"></div>
    <div class="flex justify-between">
      <div class="flex">
        <div>
          <label
            ><input
              v-model="query"
              type="text"
              placeholder="id, username, email, telegram"
              class="input input-bordered input-l ml-4 w-80"
              @input="onInput($event)"
            />
          </label>
          <span
            v-if="inputLoading"
            class="loading loading-spinner text-primary loading-large ml-4"
          />
        </div>
        <select
          class="select select-bordered w-50 ml-3"
          @change="getUsers"
          v-model="selectedUserRole"
        >
          <option selected value="">все роли</option>
          <option v-for="role in roles" :value="role.value">
            {{ role.text }}
          </option>
        </select>
        <button class="btn btn-primary ml-3" @click="getUsers">
          Применить
        </button>
      </div>
      <div>
        <button
          class="btn btn-primary mr-4"
          @click="
            ;[
              (createMode = true),
              (userEditForm = {
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                roles: ['user'],
                tabs: [],
                allowedUsers: [],
                restrictedUsers: [],
              }),
              (selectedUser = {
                username: '',
              }),
              openEditUsersModal(),
            ]
          "
        >
          Добавить пользователя
        </button>
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
            <th>Никнейм</th>
            <th>ФИО</th>
            <th>Telegram</th>
            <th>Роли</th>
            <th>
              <div @click="sortByDate" class="flex cursor-pointer">
                Дата регистрации
                <Icon
                  class="swap-on fill-current ml-1 w-6 h-5"
                  :name="dateSortIcon"
                />
              </div>
            </th>
            <th>Управление</th>
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr v-for="user in users" class="hover">
            <th style="max-width: 80px; min-width: 70px">
              {{ user.uuid }}
            </th>
            <th style="max-width: 150px; min-width: 90px" class="text-xs">
              {{ user.username }}
            </th>
            <th style="max-width: 150px; min-width: 90px" class="text-xs">
              {{ user.firstName }} {{ user.lastName }}
            </th>
            <th style="max-width: 120px; min-width: 100px">
              {{ user.telegram }}
            </th>
            <th style="max-width: 100px; min-width: 90px">
              {{ user.roles.map((role: any) => role).join(', ') }}
            </th>
            <th
              style="max-width: 60px; min-width: 40px"
              class="overflow-x-auto"
            >
              {{ defaultDate(user.registrationDate) }}
            </th>
            <th style="max-width: 30px; min-width: 20px">
              <button
                class="btn btn-primary btn-sm"
                @click="
                  ;[
                    (createMode = false),
                    selectUser(user),
                    openEditUsersModal(),
                  ]
                "
              >
                редактировать
              </button>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <input type="checkbox" id="editUsersModal" class="modal-toggle" />
  <div class="modal cursor-pointer" @click="openEditUsersModal">
    <div class="modal-box w-7/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="editUsersModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          ref="editUsersModalClose"
        >
          ✕
        </label>
      </form>

      <div class="text-center">
        {{ selectedUser.username }}
      </div>
      <div>
        <div class="flex mt-4 gap-4">
          <input
            placeholder="Никнейм"
            v-model="userEditForm.username"
            class="input input-bordered w-full"
          />
          <input
            placeholder="email"
            v-model="userEditForm.email"
            class="input input-bordered w-full"
          />
        </div>
        <div class="flex mt-4 gap-4">
          <input
            placeholder="Имя"
            v-model="userEditForm.firstName"
            class="input input-bordered w-full"
          />
          <input
            placeholder="Фамилия"
            v-model="userEditForm.lastName"
            class="input input-bordered w-full"
          />
        </div>
        <div class="flex mt-4 gap-4">
          <input
            placeholder="Пароль"
            v-model="password"
            class="input input-bordered w-full"
          />
          <input
            placeholder="Повторите пароль"
            v-model="repeatPassword"
            class="input input-bordered w-full"
          />
        </div>
      </div>
      <div class="divider"></div>
      <!-- <div class="flex justify-between">
        <div class="mb-1">
          Роли: {{ userEditForm.roles.map((role: any) => role).join(', ') }}
        </div>
        <button
          :class="{
            'btn-outline':userEditForm.roles.map((role: any) => role).join(', '),
          }"
          class="btn btn-primary btn-sm normal-case"
          @click="$emit('ruleModalOpen')"
        >
          {{ 'Настроить' }}
        </button>
      </div> -->
      <div v-if="isSelectedUserAdmin">
        <div class="mb-3 flex flex-col">
          <div class="mb-2">
            <span class="my-2 ml-2"> Разрешенные пользователи </span>
            <button
              class="btn max-w-xl w-xl"
              @click="store.allowedUsersModal = true"
            >
              {{
                userEditForm.allowedUsers.length <= 0
                  ? 'Выбраны все пользователи'
                  : 'Выбрано клиентов ' + userEditForm.allowedUsers.length
              }}
            </button>
          </div>
          <div>
            <span class="mt-2 ml-2"> Недоступные пользователи </span>
            <button
              class="ml-2 btn max-w-xs w-xl"
              @click="store.restrictedUsersModal = true"
            >
              {{
                userEditForm.restrictedUsers.length <= 0
                  ? 'Нет недоступных клиентов'
                  : 'Недоступных клиентов ' +
                    userEditForm.restrictedUsers.length
              }}
            </button>
          </div>
        </div>
        <div class="divider"></div>
      </div>
      <div class="collapse bg-base-200 collapse-arrow mb-2">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium">Настроить роли</div>
        <div class="collapse-content">
          <div class="flex flex-col">
            <div class="form-control" v-for="role in roles">
              <label class="label cursor-pointer">
                <span class="label-text mr-2">{{ role.text }}</span>
                <input
                  type="checkbox"
                  :checked="userEditForm.roles.includes(role.value)"
                  :disabled="role.disabled"
                  class="checkbox checkbox-primary"
                  @change="
                    userEditForm.roles.includes(role.value)
                      ? userEditForm.roles.splice(
                          userEditForm.roles.indexOf(role.value),
                          1
                        )
                      : userEditForm.roles.push(role.value)
                  "
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isSelectedUserAdmin"
        class="collapse bg-base-200 collapse-arrow"
      >
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium">
          Настроить доступные разделы
        </div>
        <div class="collapse-content">
          <div class="flex flex-col">
            <div class="form-control" v-for="tab in tabs">
              <label class="label cursor-pointer">
                <span class="label-text mr-2">{{ tab }}</span>
                <input
                  type="checkbox"
                  class="checkbox checkbox-primary"
                  :checked="userEditForm.tabs.includes(tab)"
                  @click="
                    userEditForm.tabs.includes(tab)
                      ? userEditForm.tabs.splice(
                          userEditForm.tabs.indexOf(tab),
                          1
                        )
                      : userEditForm.tabs.push(tab)
                  "
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="modal-action">
          <label
            class="btn btn-error btn-sm bg-red-400"
            for="editUsersModal"
            @click="
              userEditForm = {
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                roles: ['user'],
                tabs: [],
                allowedUsers: [],
                restrictedUsers: [],
              }
            "
          >
            Отмена
          </label>
          <button
            v-if="!createMode"
            class="btn btn-sm btn-primary"
            @click="saveUser"
          >
            Сохранить
          </button>
          <button
            v-if="createMode"
            class="btn btn-sm btn-primary"
            @click=";[(selectedUser = { username: '' }), saveUser()]"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  </div>
  <allowedUsersModal
    ref="allowedUsersModalRef"
    :selectedUsers="userEditForm.allowedUsers"
    @clearUsers="userEditForm.allowedUsers = []"
  />
  <restrickedUsersModal
    ref="restrictedUsersModalRef"
    :selectedUsers="userEditForm.restrictedUsers"
    @clearUsers="userEditForm.restrictedUsers = []"
  />
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
