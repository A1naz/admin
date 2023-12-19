<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification';

const store = useMainStore()
const inputLoading = ref(false)
const props = defineProps({
  selectAll: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['selectUser', 'selectAllUsers'])
const selectedUser = ref<any>({
  username: '',
})
const selectedUsers = ref<any>([])
const selectUserClose: any = ref(null)
const query = ref('')
const users = ref<any>([])

async function onInput(event: Event) {
  findSearchQueryDebounced()
}
function openUsersSelectModal() {
  selectUserClose.value?.click()
}

async function getUsers(searchValue: string = '') {
  const { data }: any = await useFetch('/api/user/getUsers', {
    method: 'GET',
    params: {
      page: 1,
      searchValue,
    },
  })
  if (data.value) {
    users.value = data.value.users
  }
}
const findSearchQuery = async () => {
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  await getUsers(query.value)
  inputLoading.value = false
}
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

async function selectUser(uuid: String, select: boolean) {
  users.value.forEach((user: any) => {
    if (user._id === uuid) {
      if (!select) {
        user.isSelected = true
        selectedUsers.value.push(user._id)
      } else {
        user.isSelected = false
        selectedUsers.value.forEach((el: any, i: any) => {
          if (el == uuid) {
            selectedUsers.value.splice(i, 1)
          }
        })
      }
    }
  })
}

function selectAllUsers() {
  notify({
    title: 'Внимание',
    text: 'Выбраны все пользователи, будьте внимательны при изменении тарифов',
  })
  emit('selectUser', {
    uuid: 'all',
    username: 'all',
  })
  selectedUser.value = {
    uuid: 'all',
    username: 'all',
  }
  selectUserClose.value?.click()
}

getUsers()
</script>

<template>
  <button class="ml-2 btn max-w-xl w-xl" @click="store.allowedUsersModal = true">
    {{
      selectedUser.uuid == 'all'
        ? 'Выбраны все пользователи'
        : selectedUser.username == ''
        ? 'Выбрать пользователя'
        : selectedUser.username
    }}
  </button>

  <input type="checkbox" id="selectUser" class="modal-toggle" />
  <div 
  :class="{
      'modal-open': store.allowedUsersModal,
    }"
  class="modal cursor-pointer" 
  @click="store.allowedUsersModal = false">
  <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectUsers"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="store.allowedUsersModal = false"
        >
          ✕
        </label>
      </form>

      <div>
        <div class="justify-between flex">
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
          <label
            class="btn btn-primary mr-4 btn-sm mt-4"
            @click="
              ;[(users = []), openUsersSelectModal(), (selectedUsers = [])]
            "
            >Выбрать всех</label
          >
        </div>

        <div
          class="my-2 mx-2 overflow-y-auto"
          :style="{ 'max-height': 500 + 'px' }"
        >
          <table class="table my-3">
            <!-- head -->
            <thead>
              <tr>
                <th>id</th>
                <th>username</th>
                <th>email</th>
                <th>telegram</th>
                <th>Выбрать</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover" v-for="user in users" :key="user.uuid">
                <td style="max-width: 130px">{{ user.uuid }}</td>
                <td style="max-width: 150px">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.username }}
                  </div>
                </td>
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.email }}
                  </div>
                </td>
                <td style="max-width: 150px" class="overflow-x-auto">
                  <div class="mx-1 overflow-x-auto">
                    {{ user.telegram }}
                  </div>
                </td>
                <td style="max-width: 20px">
                  <div>
                    <input
                      type="checkbox"
                      :checked="user.isSelected"
                      class="checkbox checkbox-primary"
                      @click="selectUser(user._id, user.isSelected)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-action"></div>
      </div>
    </div>
  </div>
</template>
