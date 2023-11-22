<script lang="ts" setup>
const inputLoading = ref(false)
const emit = defineEmits(['selectUser'])
const selectedUser = ref<any>({
  username: '',
})
const selectUserClose: any = ref(null)
const query = ref('89052008759')
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

async function selectUser(user: any) {
  selectedUser.value = user
  emit('selectUser', user)
  selectUserClose.value?.click()
}

getUsers()
</script>

<template>
  <button class="ml-2 btn max-w-xl w-xl" @click="openUsersSelectModal">
    {{
      selectedUser.username == ''
        ? 'Выбрать пользователя'
        : selectedUser.username
    }}
  </button>

  <input type="checkbox" id="selectUser" class="modal-toggle" />
  <div class="modal cursor-pointer" @click="openUsersSelectModal">
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectUser"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          ref="selectUserClose"
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
                placeholder="Введите id или username или email"
                class="input input-bordered input-l ml-4 w-80"
                @input="onInput($event)"
              />
            </label>
            <span
              v-if="inputLoading"
              class="loading loading-spinner text-primary loading-large ml-4"
            />
          </div>
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
                <td style="max-width: 20px">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="selectUser(user)"
                  >
                    Выбрать
                  </button>
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
