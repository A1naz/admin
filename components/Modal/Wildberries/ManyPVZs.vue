<script setup lang="ts">
const props = defineProps({
  selectedPVZs: {
    type: Array,
    default: () => [],
  },
  selectedUsers: {
    type: Array,
    default: () => [],
  },
})

const query = ref('')
const inputLoading = ref(false)
const PVZs = ref<any>([])
const visiblePVZs = ref<any>([])
const showOnlySelected = ref(false)

const selectedPVZs = toRef(props, 'selectedPVZs')
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
  await getPVZs(query.value)
  inputLoading.value = false
}
async function getPVZs(searchValue: string = '') {
  const { data }: any = await useFetch('/api/wildberries/pvz/getPVZs', {
    method: 'GET',
    params: {
      page: 1,
      searchValue,
      users: selectedUsers.value.map((el: any) => el._id),
    },
  })

  PVZs.value = data.value.PVZs
  visiblePVZs.value = PVZs.value

  PVZs.value.forEach((PVZ: any) => {
    selectedPVZs.value.forEach((el: any) => {
      if (el.uuid == PVZ.uuid) {
        PVZ.isSelected = true
      }
    })
  })
}

function selectPVZ(uuid: String, select: boolean) {

  PVZs.value.forEach((PVZ: any) => {
    if (PVZ.uuid === uuid) {
      if (!select) {
        PVZ.isSelected = true
        selectedPVZs.value.push(PVZ)
      } else {
        PVZ.isSelected = false
        selectedPVZs.value.forEach((el: any, i: any) => {
          if (el.uuid == uuid) {
            selectedPVZs.value.splice(i, 1)
          }
        })
      }
    }
  })

  if (showOnlySelected) {
    selectedPVZs.value.forEach((PVZ: any) => {
      if (PVZ.uuid === uuid) {
        if (select) {
          PVZ.isSelected = false
          selectedPVZs.value.forEach((el: any, i: any) => {
            if (el.uuid == uuid) {
              selectedPVZs.value.splice(i, 1)
            }
          })
          visiblePVZs.value = selectedPVZs.value
        }
      }
    })
  }
}

function showOnlySelectedPVZ() {
  if (showOnlySelected.value) {
    showOnlySelected.value = false
    visiblePVZs.value = PVZs.value
  } else {
    showOnlySelected.value = true
    visiblePVZs.value = selectedPVZs.value
  }
}
</script>
<template>
  <button
    :disabled="!selectedUsers.length"
    class="ml-2 btn"
    @click=";[(isModalOpen = true), !selectedPVZs.length ? getPVZs() : null]"
  >
    {{
      selectedPVZs.length > 0
        ? 'Выбрано ПВЗ: ' + selectedPVZs.length
        : 'Выбрать ПВЗ'
    }}
  </button>
  <!-- <div

    :class="{ 'modal-open': state }" 
    class="modal"
  > -->
  <div
    id="selectPVZs"
    class="modal cursor-pointer"
    :class="{ 'modal-open': isModalOpen }"
    @click="isModalOpen = false"
  >
    <div
      class="modal-box w-9/12 max-w-full max-h-3/4 min-h-[300px] cursor-auto"
      @click.stop
    >
      <form method="dialog">
        <label
          for="selectPVZs"
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
                placeholder="Название адресса ПВЗ"
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
              ;[(PVZs = []), isModalOpen = false, (selectedPVZ = [])]
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
                @click="showOnlySelectedPVZ"
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
                <th>Название адресса ПВЗ</th>
                <th>Выбрать</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover" v-for="PVZ in visiblePVZs" :key="PVZ.uuid">
                <td style="max-width: 500px">{{ PVZ.address }}</td>
                <td style="max-width: 20px">
                  <div>
                    <input
                      type="checkbox"
                      :checked="PVZ.isSelected"
                      class="checkbox checkbox-primary"
                      @click="selectPVZ(PVZ.uuid, PVZ.isSelected)"
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
