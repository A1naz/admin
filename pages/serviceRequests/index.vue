<script setup lang="ts">
const { height, width } = useWindowSize()

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Запросы направлений',
})

const store = useMainStore()
if (
  !store.client.mainAdmin &&
  !store.client.tabs.includes('запросы скриншотов')
) {
  navigateTo('/partner')
}

const query = ref('')
const selectedType = ref('marketPlaces')
const selectedUnderType = ref('any')
const underTypes = ref([
  'Маркетплейсы',
  'Интернет-магазины',
  'Отели',
  'Доски объявлений',
  'Медицина',
  'Карты',
  'Стриминг',
  'Блоггинг',
])
const resData = ref<any>([])

async function getData() {
  resData.value = []

  const { data, error } = await useFetch(
    '/api/serviceRequests/' + selectedType.value,
    {
      params: {
        type: selectedUnderType.value,
        query: query.value,
      },
      method: 'GET',
      watch: false,
    }
  )
  if (data.value) {
    resData.value = data.value
  }
}

getData()

watch(selectedType, () => {
  getData()
})

const findSearchQueryDebounced = useDebounceFn(getData, 1000)
async function onInput(event: Event) {
  findSearchQueryDebounced()
}
</script>
<template>
  <h1 class="text-2xl font-bold ml-5 my-2">Запросы направлений</h1>
  <div class="divider"></div>
  <div class="ml-4 flex gap-1">
    <select class="select select-bordered max-w-xs mb-2" v-model="selectedType">
      <option selected value="marketPlaces">Категории</option>
      <option value="services">Услуги</option>
    </select>
    <select
      v-if="selectedType == 'marketPlaces'"
      class="select select-bordered max-w-xs mb-2"
      v-model="selectedUnderType"
      @change="getData"
    >
      <option selected value="any">Все</option>
      <option v-for="type in underTypes" :value="type">{{ type }}</option>
    </select>
    <div>
      <label
        ><input
          v-model="query"
          type="text"
          placeholder="Поиск по услуге"
          class="input input-bordered input-l ml-4 w-52"
          @input="onInput($event)"
        />
      </label>
    </div>
  </div>
  <div
    class="my-2 mx-2 overflow-y-auto"
    :style="{ 'max-height': height - 270 + 'px' }"
  >
    <table class="table table-pin-rows">
      <!-- head -->
      <thead>
        <tr>
          <th>Направление</th>
          <th>Категория</th>
          <th>Услуга</th>
          <th>Запросов</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr v-for="info in resData" class="hover">
          <th>{{ info.slug }}</th>
          <th>{{ info.type }}</th>
          <th>{{ info.name }}</th>
          <th>{{ info.votes }}</th>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
::-webkit-scrollbar {
  height: 4px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
}
</style>
