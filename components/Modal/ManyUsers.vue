<script setup lang="ts">
const props = defineProps({
  selectedUsers: {
    type: Array,
    default: () => [],
  },
})

const query = ref('')
const inputLoading = ref(false)
const users = ref<any>([])
const visibleUsers = ref<any>([])
const showOnlySelected = ref(false)

const selectedUsers = toRef(props, 'selectedUsers')
const isModalOpen = ref(false)
async function onInput(event: Event) {
  findSearchQueryDebounced()
}
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)
async function findSearchQuery() {
  if (query.value.replaceAll(' ', '') == '') {
    return
  }
  inputLoading.value = true
  showOnlySelected.value = false
  await getUsers(query.value)
  inputLoading.value = false
}
async function getUsers(searchValue: string = '') {
  const { data }: any = await useFetch('/api/user/getUsers', {
    method: 'GET',
    params: {
      page: 1,
      searchValue,
    },
  })

  users.value = data.value.users
  visibleUsers.value = users.value

  users.value.forEach((user: any) => {
    selectedUsers.value.forEach((el: any) => {
      if (el.uuid == user.uuid) {
        user.isSelected = true
      }
    })
  })
}

getUsers()

function selectUser(uuid: String, select: boolean) {
  console.log(uuid, select)

  users.value.forEach((user: any) => {
    if (user._id === uuid) {
      if (!select) {
        user.isSelected = true
        selectedUsers.value.push(user)
      } else {
        user.isSelected = false
        selectedUsers.value.forEach((el: any, i: any) => {
          if (el._id == uuid) {
            selectedUsers.value.splice(i, 1)
          }
        })
      }
    }
  })

  if (showOnlySelected) {
    selectedUsers.value.forEach((user: any) => {
      if (user._id === uuid) {
        if (select) {
          user.isSelected = false
          selectedUsers.value.forEach((el: any, i: any) => {
            if (el._id == uuid) {
              selectedUsers.value.splice(i, 1)
            }
          })
          visibleUsers.value = selectedUsers.value
        }
      }
    })
  }
}

function showOnlySelectedUser() {
  if (showOnlySelected.value) {
    showOnlySelected.value = false
    visibleUsers.value = users.value
  } else {
    showOnlySelected.value = true
    visibleUsers.value = selectedUsers.value
  }
}
</script>
<template>
  <button class="ml-2 btn" @click="isModalOpen = true">
    {{
      selectedUsers.length > 0
        ? 'Выбрано Клиентов: ' + selectedUsers.length
        : 'Выбрать Клиентов'
    }}
  </button>
  <!-- <div

    :class="{ 'modal-open': state }" 
    class="modal"
  > -->
  <div
    id="selectUsers"
    class="modal cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="isModalOpen = false"
  >
    <div class="modal-box w-9/12 max-w-full cursor-auto" @click.stop>
      <form method="dialog">
        <label
          for="selectUsers"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="isModalOpen = false"
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
          <!-- <label
            class="btn btn-primary mr-4 btn-sm mt-4"
            @click="
              ;[(users = []), isModalOpen = false, (selectedUsers = [])]
            "
            >Выбрать всех</label
          > -->
          <div class="form-control mr-6 mt-4">
            <label class="label cursor-pointer">
              <span class="label-text mr-4">Показать только выбранных</span>
              <input
                type="checkbox"
                :checked="showOnlySelected"
                class="checkbox checkbox-primary"
                @click="showOnlySelectedUser"
              />
            </label>
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
                <th>telegram</th>
                <th>Выбрать</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover" v-for="user in visibleUsers" :key="user.uuid">
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
