<script setup lang="ts">
const store = useMainStore()
if (!store.client.mainAdmin && !store.client.tabs.includes('utm метки')) {
  navigateTo('/partner')
}

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'UTM метки',
})

import { notify } from '@kyvg/vue3-notification'
const { height } = useWindowSize()
const dateSortIcon = ref('mdi-arrow-down')
const elPerPage = 50
const curPage = ref(1)
const pages = ref(0)
const searchQuery = ref('')
const isPageBtnsDisabled = ref(false)
const tags = ref<any[]>([])
const tagsCount = ref(0)
const showCreateModal = ref(false)
const newTagName = ref('')
const isCreating = ref(false)
const createModalRef: any = ref(null)
const closeModalRef: any = ref(null)

// Категории и площадки
const categories = ref<any[]>([])
const platforms = ref<any[]>([])
const selectedCategory = ref('')
const selectedPlatform = ref('')

// Фильтры по категории и площадке
const filterCategory = ref('')
const filterPlatform = ref('')

const dateRange = ref([])
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
// Модалки для создания категорий/площадок
const showCategoryModal = ref(false)
const showPlatformModal = ref(false)
const newCategoryName = ref('')
const newPlatformName = ref('')
const isCreatingCategory = ref(false)
const isCreatingPlatform = ref(false)
const categoryModalRef: any = ref(null)
const platformModalRef: any = ref(null)
const closeCategoryModalRef: any = ref(null)
const closePlatformModalRef: any = ref(null)

async function getTags() {
  curPage.value = 1
  const { data }: any = await useFetch('/api/utmTags', {
    method: 'GET',
    params: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      search: searchQuery.value,
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
      categoryId: filterCategory.value || null,
      platformId: filterPlatform.value || null,
    },
  })
  if (data.value) {
    tagsCount.value = data.value.count
    tags.value = data.value.tags
    pages.value = Math.ceil(tagsCount.value / elPerPage)
  }
}

const getTagsDebounced = useDebounceFn(getTags, 1000)

watch(searchQuery, () => {
  getTagsDebounced()
})

watch(dateRange, () => {
  getTags()
})

watch(filterCategory, () => {
  getTags()
})

watch(filterPlatform, () => {
  getTags()
})

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
  const { data }: any = await useFetch('/api/utmTags', {
    method: 'GET',
    params: {
      page: curPage.value,
      sortDate: dateSortIcon.value == 'mdi-arrow-up' ? 1 : -1,
      search: searchQuery.value,
      dateRange: dateRange.value.length > 0 ? dateRange.value : null,
      categoryId: filterCategory.value || null,
      platformId: filterPlatform.value || null,
    },
  })
  if (data.value) {
    tagsCount.value = data.value.count
    tags.value = data.value.tags
    pages.value = Math.ceil(tagsCount.value / elPerPage)
  }
  isPageBtnsDisabled.value = false
}

function sortByDate() {
  if (dateSortIcon.value == 'mdi-arrow-up') {
    dateSortIcon.value = 'mdi-arrow-down'
  } else {
    dateSortIcon.value = 'mdi-arrow-up'
  }
  getTags()
}

async function loadCategories() {
  const { data }: any = await useFetch('/api/utmTags/categories', {
    method: 'GET',
    watch: false,
  })
  if (data.value) {
    categories.value = data.value.categories
  }
}

async function loadPlatforms() {
  const { data }: any = await useFetch('/api/utmTags/platforms', {
    method: 'GET',
    watch: false,
  })
  if (data.value) {
    platforms.value = data.value.platforms
  }
}

function openCreateModal() {
  newTagName.value = ''
  selectedCategory.value = ''
  selectedPlatform.value = ''
  loadCategories()
  loadPlatforms()
  createModalRef.value?.showModal()
}

function openCategoryModal() {
  newCategoryName.value = ''
  categoryModalRef.value?.showModal()
}

function openPlatformModal() {
  newPlatformName.value = ''
  platformModalRef.value?.showModal()
}

async function createCategory() {
  if (!newCategoryName.value || newCategoryName.value.trim().length === 0) {
    notify({
      type: 'error',
      title: 'Введите название категории',
    })
    return
  }

  isCreatingCategory.value = true
  const { data, error }: any = await useFetch('/api/utmTags/categories/create', {
    method: 'POST',
    body: {
      name: newCategoryName.value,
    },
    watch: false,
  })

  if (data.value?.success) {
    notify({
      type: 'success',
      title: 'Категория создана',
    })
    closeCategoryModalRef.value?.click()
    newCategoryName.value = ''
    await loadCategories()
    selectedCategory.value = data.value.category._id
  }

  if (error.value) {
    notify({
      type: 'error',
      title: error.value.data?.statusMessage || 'Ошибка при создании категории',
    })
  }

  isCreatingCategory.value = false
}

async function createPlatform() {
  if (!newPlatformName.value || newPlatformName.value.trim().length === 0) {
    notify({
      type: 'error',
      title: 'Введите название площадки',
    })
    return
  }

  isCreatingPlatform.value = true
  const { data, error }: any = await useFetch('/api/utmTags/platforms/create', {
    method: 'POST',
    body: {
      name: newPlatformName.value,
    },
    watch: false,
  })

  if (data.value?.success) {
    notify({
      type: 'success',
      title: 'Площадка создана',
    })
    closePlatformModalRef.value?.click()
    newPlatformName.value = ''
    await loadPlatforms()
    selectedPlatform.value = data.value.platform._id
  }

  if (error.value) {
    notify({
      type: 'error',
      title: error.value.data?.statusMessage || 'Ошибка при создании площадки',
    })
  }

  isCreatingPlatform.value = false
}

async function createTag() {
  if (!newTagName.value || newTagName.value.trim().length === 0) {
    notify({
      type: 'error',
      title: 'Введите название метки',
    })
    return
  }

  isCreating.value = true
  const { data, error }: any = await useFetch('/api/utmTags/create', {
    method: 'POST',
    body: {
      name: newTagName.value,
      categoryId: selectedCategory.value || null,
      platformId: selectedPlatform.value || null,
    },
    watch: false,
  })

  if (data.value?.success) {
    notify({
      type: 'success',
      title: 'UTM метка создана',
    })
    closeModalRef.value?.click()
    newTagName.value = ''
    getTags()
  }

  if (error.value) {
    notify({
      type: 'error',
      title: error.value.data?.statusMessage || 'Ошибка при создании метки',
    })
  }

  isCreating.value = false
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText("https://harmex.ru?utm="+text).then(() => {
    notify({
      type: 'success',
      title: 'Скопировано в буфер обмена',
    })
  })
}

// Загружаем категории и площадки при инициализации
loadCategories()
loadPlatforms()
getTags()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold ml-5 my-2">UTM метки</h1>
    <div class="card p-fluid"></div>

    <div class="divider"></div>
    <div class="flex justify-between">
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию, коду или создателю"
          class="input input-bordered ml-2 w-80"
        />
        
        <select
          v-model="filterCategory"
          class="select select-bordered w-48"
        >
          <option value="">Все категории</option>
          <option
            v-for="category in categories"
            :key="category._id"
            :value="category._id"
          >
            {{ category.name }}
          </option>
        </select>

        <select
          v-model="filterPlatform"
          class="select select-bordered w-48"
        >
          <option value="">Все площадки</option>
          <option
            v-for="platform in platforms"
            :key="platform._id"
            :value="platform._id"
          >
            {{ platform.name }}
          </option>
        </select>

        <button class="btn btn-primary" @click="openCreateModal">
          <Icon name="material-symbols:add" size="20" />
          Создать метку
        </button>

        <DateRangePicker
          class="w-46"
          v-model="dateRange"
          :start-date="startDate"
          @reset="dateRange = []"
        >
          <button class="btn btn-primary min-w-2xl">
            {{
              dateRange.length > 1
                ? `${$dayjs(dateRange[0]).format('DD.MM.YYYY')} - ${$dayjs(
                    dateRange[1]
                  ).format('DD.MM.YYYY')}`
                : 'Выбрать даты'
            }}
          </button>
        </DateRangePicker>
        
      </div>
      <div class="join mr-2">
        <button
          class="join-item btn"
          @click="swapPage(-1)"
          :disabled="isPageBtnsDisabled"
        >
          «
        </button>
        <button class="join-item btn">{{ curPage }} из {{ pages }}</button>
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
            <th>Название</th>
            <th>UTM код</th>
            <th>Категория</th>
            <th>Площадка</th>
            <th>
              <div @click="sortByDate" class="flex cursor-pointer">
                Дата создания
                <Icon
                  class="swap-on fill-current ml-1 w-6 h-5"
                  :name="dateSortIcon"
                />
              </div>
            </th>
            <th>Создатель</th>
            <th>Переходы на лендинг</th>
            <th>Переходы на портал</th>
            <th>Регистрации</th>
            <th>Пополнения</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in tags" :key="tag._id" class="hover">
            <td>{{ tag.name }}</td>
            <td>
              <div class="flex items-center gap-2">
                <code class="bg-base-200 px-2 py-1 rounded">{{
                  tag.utmCode
                }}</code>
                <button
                  class="btn btn-xs btn-ghost"
                  @click="copyToClipboard(tag.utmCode)"
                  title="Копировать ссылку"
                >
                  <Icon name="material-symbols:content-copy" size="16" />
                </button>
              </div>
            </td>
            <td>{{ tag.categoryName || '-' }}</td>
            <td>{{ tag.platformName || '-' }}</td>
            <td>{{ new Date(tag.createdAt).toLocaleString() }}</td>
            <td>{{ tag.createdByUsername }}</td>
            <td>{{ tag.transitionToLanding }}</td>
            <td>{{ tag.transitionToPortal }}</td>
            <td>{{ tag.registrationsCount }}</td>
            <td>{{ tag.paymentsCount }}</td>
            <td>
              <button
                class="btn btn-xs btn-primary"
                @click="copyToClipboard(tag.utmCode)"
              >
                Копировать
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <dialog id="createTagModal" class="modal" ref="createModalRef">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Создать новую UTM метку</h3>
        <div class="flex flex-col gap-4">
          <div>
            <label class="label">
              <span class="label-text">Название метки</span>
            </label>
            <input
              v-model="newTagName"
              type="text"
              placeholder="Например: spring_campaign_2026"
              class="input input-bordered w-full"
            />
            <label class="label">
              <span class="label-text-alt"
                >Будет создан код типа: utm_xxxxxxxx</span
              >
            </label>
          </div>

          <!-- Категория -->
          <div>
            <label class="label">
              <span class="label-text">Категория</span>
            </label>
            <div class="flex gap-2">
              <select
                v-model="selectedCategory"
                class="select select-bordered flex-1"
              >
                <option value="">Выберите категорию</option>
                <option
                  v-for="category in categories"
                  :key="category._id"
                  :value="category._id"
                >
                  {{ category.name }}
                </option>
              </select>
              <button
                class="btn btn-square btn-primary"
                @click="openCategoryModal"
                type="button"
              >
                <Icon name="material-symbols:add" size="20" />
              </button>
            </div>
          </div>

          <!-- Площадка -->
          <div>
            <label class="label">
              <span class="label-text">Площадка</span>
            </label>
            <div class="flex gap-2">
              <select
                v-model="selectedPlatform"
                class="select select-bordered flex-1"
              >
                <option value="">Выберите площадку</option>
                <option
                  v-for="platform in platforms"
                  :key="platform._id"
                  :value="platform._id"
                >
                  {{ platform.name }}
                </option>
              </select>
              <button
                class="btn btn-square btn-primary"
                @click="openPlatformModal"
                type="button"
              >
                <Icon name="material-symbols:add" size="20" />
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button
              class="btn btn-ghost"
              @click="closeModalRef?.click()"
              :disabled="isCreating"
            >
              Отмена
            </button>
            <button
              class="btn btn-primary"
              @click="createTag"
              :disabled="isCreating"
            >
              <span v-if="isCreating" class="loading loading-spinner"></span>
              <span v-else>Создать</span>
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button ref="closeModalRef">close</button>
      </form>
    </dialog>

    <!-- Category Modal -->
    <dialog id="categoryModal" class="modal" ref="categoryModalRef">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Создать категорию</h3>
        <div class="flex flex-col gap-4">
          <div>
            <label class="label">
              <span class="label-text">Название категории</span>
            </label>
            <input
              v-model="newCategoryName"
              type="text"
              placeholder="Например: Реклама"
              class="input input-bordered w-full"
              @keyup.enter="createCategory"
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              class="btn btn-ghost"
              @click="closeCategoryModalRef?.click()"
              :disabled="isCreatingCategory"
            >
              Отмена
            </button>
            <button
              class="btn btn-primary"
              @click="createCategory"
              :disabled="isCreatingCategory"
            >
              <span v-if="isCreatingCategory" class="loading loading-spinner"></span>
              <span v-else>Создать</span>
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button ref="closeCategoryModalRef">close</button>
      </form>
    </dialog>

    <!-- Platform Modal -->
    <dialog id="platformModal" class="modal" ref="platformModalRef">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Создать площадку</h3>
        <div class="flex flex-col gap-4">
          <div>
            <label class="label">
              <span class="label-text">Название площадки</span>
            </label>
            <input
              v-model="newPlatformName"
              type="text"
              placeholder="Например: VK Реклама"
              class="input input-bordered w-full"
              @keyup.enter="createPlatform"
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              class="btn btn-ghost"
              @click="closePlatformModalRef?.click()"
              :disabled="isCreatingPlatform"
            >
              Отмена
            </button>
            <button
              class="btn btn-primary"
              @click="createPlatform"
              :disabled="isCreatingPlatform"
            >
              <span v-if="isCreatingPlatform" class="loading loading-spinner"></span>
              <span v-else>Создать</span>
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button ref="closePlatformModalRef">close</button>
      </form>
    </dialog>
  </div>
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

