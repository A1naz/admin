<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
const props: any = defineProps({
  user: Object,
  userReferrals: Array,
  loading: Boolean,
  referrals: Array,
  filteredReferrals: Array
})

const emit = defineEmits(['searchReferrals'])

const user: any = toRef(props, 'user')
const referrals = toRef(props, 'referrals')
const filteredReferrals = toRef(props, 'filteredReferrals')
const loading = toRef(props, 'loading')
const query = ref('')
const users = ref<any>([])
const inputLoading = ref(false)

async function onInput(event: Event) {
  findSearchQueryDebounced()
}

async function searchReferrals(searchValue: string) {
  emit('searchReferrals', searchValue)
}
const findSearchQuery = () => {
  inputLoading.value = true
  searchReferrals(query.value)
  inputLoading.value = false
}

const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000)

async function addToReferral(userId: String) {
  if (userId === user.value.uuid) {
    notify({
      type: 'error',
      title: 'Нельзя добавить самого себя в рефералы',
    })
    return
  }
  const { data, error }: any = await useFetch('/api/partner/addToReferral', {
    method: 'POST',
    params: {
      refId: user.value.uuid,
      userId,
    },
  })
  if (error.value) {
    notify({
      type: 'error',
      title: error.value.data.message,
      duration: 7000,
    })
  }

  if (data.value) {
    filteredReferrals.value.forEach((el: any, i: any) => {
      if (el.uuid === userId) {
        filteredReferrals.value[i].requireToAddReferral = false
      }
    })
    notify({
      type: 'success',
      title: 'Реферал добавлен',
    })
  }
}

async function deleteFromReferral(userId: String) {
  const { data, error }: any = await useFetch(
    '/api/partner/deleteFromReferral',
    {
      method: 'POST',
      params: {
        userId,
      },
    }
  )
  if (error.value) {
    notify({
      type: 'error',
      title: error.value.data.message,
      duration: 7000,
    })
  }
  if (data.value) {
    filteredReferrals.value.forEach((el: any, i: any) => {
      if (el.uuid === userId) {
        filteredReferrals.value[i].requireToAddReferral = true
      }
    })
    notify({
      type: 'success',
      title: 'Пользователь удален из рефералов',
    })
  }
}
</script>

<template>
  <input type="checkbox" id="referral_options_modal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box w-9/12 max-w-full">
      <form method="dialog">
        <label
          for="referral_options_modal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </label>
      </form>
      <div class="my-2 ml-5">Рефералы пользователя: {{ user.username }}</div>
      <div v-if="loading" class="hero">
        <span class="loading loading-dots loading-lg my-2"></span>
      </div>
      <div class="overflow-x-auto" v-else-if="!loading">
        <div v-if="referrals.length > 0">
          <label
            ><input
              v-model="query"
              type="text"
              placeholder="id, username, email, организация"
              class="input input-bordered input-l ml-4 w-80"
              @input="onInput($event)"
            />
          </label>
          <span
            v-if="inputLoading"
            class="loading loading-spinner text-primary loading-large ml-4"
          />
        </div>
        <div v-else>
          <h1 class="hero text-xl font-bold ml-5 my-2">Нет рефералов</h1>
        </div>
        <div
          class="my-2 mx-2 overflow-y-auto"
          :style="{ 'max-height': 500 + 'px' }"
        >
          <table class="table my-3" v-if="referrals.length > 0">
            <!-- head -->
            <thead>
              <tr>
                <th>id</th>
                <th>username</th>
                <th>email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="hover"
                v-for="user in filteredReferrals"
                :key="user.uuid"
              >
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
                  <div
                    v-if="user.requireToAddReferral"
                    class="tooltip"
                    data-tip="Добавить"
                  >
                    <label
                      class="btn btn-primary btn-sm"
                      @click="addToReferral(user.uuid)"
                      >+</label
                    >
                  </div>
                  <div v-else>
                    <label
                      class="btn btn-error btn-sm"
                      @click="deleteFromReferral(user.uuid)"
                    >
                      -
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-action"></div>
    </div>
    <label class="modal-backdrop cursor-pointer" for="referral_options_modal"
      >Close</label
    >
  </div>
</template>
<style scoped>
::-webkit-scrollbar {
  height: 0px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
}
</style>
