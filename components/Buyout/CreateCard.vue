import { useBuyoutStore } from '../../stores/buyout';
<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts">
const props = defineProps({
  product: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },

})

const emit = defineEmits(['callback', 'pointModalOpen', 'ruleModalOpen'])
const store = useBuyoutStore()
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))

async function deleteBuyOut() {
  store.removeProduct(props.index)
}
function onSizeChange(event: Event) {
  const target = event.target as HTMLInputElement
  store.changeSize(target.value, props.index)
}
function onSexChange(event: Event) {
  const target = event.target as HTMLInputElement
  store.changeSex(target.value, props.index)
}

function removeSearchQuery(index: number) {
  store.removeSearchQuery(props.index, index)
}
function addSearchQuery() {
  store.addSearchQuery(props.index)
}
function productSearchQueryUpdate(event: Event, index: number) {
  const newValue = (event.target as HTMLInputElement).value
  store.changeSearchQuery({
    value: newValue,
    queryIndex: props.index,
    productIndex: index,
  })
}
const productDateRangeModel = computed({
  get() {
    return props.product.dateRange
  },
  set(newValue: unknown[]) {
    store.changeDateRange(newValue, props.index)
  },
})

const productQuantityModel = computed({
  get() {
    return props.product.quantity
  },
  set(newValue: number) {
    store.changeQuantity(newValue, props.index)
  },
})
</script>

<template>
  <div class="buyout-card card bg-base-200 shadow-lg">
    <div class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative">
      <div class="dropdown dropdown-end absolute right-2 top-2 z-10">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="18" />
        </label>
        <ul tabindex="0" class="dropdown-content menu bg-base-200 p-2 shadow rounded-box w-52">
          <li>
            <a @click="deleteBuyOut">
              <Icon name="material-symbols:delete-outline" />Удалить
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="card-title">
          Выкуп №{{ index + 1 }}
        </h2>
      </div>
      <div class="flex justify-between items-center mt-2">
        <span>Даты выкупов: </span>
        <BuyoutDateRangePicker v-model="productDateRangeModel" class="w-32" :start-date="startDate" />
      </div>
      <div class="flex justify-between items-center">
        <span>Пол:</span>
        <select class="select select-sm select-bordered w-32 appearance-none" @change="onSexChange">
          <option value="none">
            Нет
          </option>
          <option value="male">
            Муж
          </option>
          <option value="female">
            Жен
          </option>
        </select>
      </div>
      <div class="flex justify-between items-center">
        <span>Правила:</span>
        <button
          :class="{
            'btn-outline': product.rules,
          }" class="btn btn-primary btn-sm normal-case w-32" @click="emit('ruleModalOpen', index)"
        >
          {{ 'Настроить' }}
        </button>
      </div>
      <div class="flex justify-between items-center mt-2">
        <div class="w-full flex flex-col items-start justify-center gap-1">
          <div class="flex justify-between gap-2 items-center w-full truncate">
            <span>Адрес:</span>
            <div v-if="product.adress" class="text-xs truncate">
              {{ product.adress
              }}
            </div>
          </div>

          <button
            :disabled="loading" :class="{
              'btn-outline': product.adress,
            }" class="btn btn-primary btn-sm normal-case w-full" @click="$emit('pointModalOpen', index)"
          >
            {{ !loading ? product.adress
              ? 'Изменить' : 'Добавить' : 'Загрузка...' }}
          </button>
        </div>
      </div>
      <div>
        <div class="w-full flex flex-col gap-2">
          <BuyoutCreateSearchQueries :product-index="props.index" :article="product.article" :queries="product.searchQuery" @update="productSearchQueryUpdate" @add="addSearchQuery" @remove="removeSearchQuery" />
        </div>
      </div>

      <div class="divider" />

      <div class="flex gap-4 items-center">
        <div class="flex items-center flex-none flex-0 flex-shrink-0 h-full" style="width: 130px;">
          <nuxt-img
            style="object-fit: fill" class="rounded-xl h-full" width="130" height="204"
            :src="product?.image || '/logo/logocolor.svg'"
            loading="lazy"
          />
        </div>
        <div class="flex flex-col truncate">
          <div class="mb-2 truncate">
            <p class="text-sm truncate">
              {{ product.name }}
            </p>
            <a
              :href="`https://www.wildberries.ru/catalog/${product.article}/detail.aspx`" target="_blank"
              class="text-sm text-secondary link link-hover"
            >
              {{ product.article }}
            </a>
          </div>
          <div>
            <span class="text-sm text-gray-500">Цена: </span>
            <span class="">{{ product.priceText }}</span>
          </div>
          <div>
            <span class="text-sm text-gray-500">Количество: </span>
            <span class="relative flex items-center flex-grow-0 w-20 m-1">
              <div class="absolute left-0 btn btn-ghost btn-sm btn-square" @click="productQuantityModel--">
                <IconCSS size="16" name="ic:round-minus" />
              </div>
              <input
                v-model="productQuantityModel" type="number" min="1" max="1000"
                class="input input-bordered input-sm w-full text-center"
              >
              <div class="absolute right-0 btn btn-ghost btn-sm btn-square" @click="productQuantityModel++">
                <IconCSS size="16" name="ic:round-plus" />
              </div>
            </span>
          </div>
          <div>
            <span class="text-sm text-gray-500">Размер: </span>
            <div class="flex items-center m-1">
              <select
                v-if="product.sizes.length" class="select select-sm select-bordered w-full"
                @change="onSizeChange"
              >
                <option
                  v-for="size in product.sizes" :key="size" :selected="product.selectedSize === size"
                  :value="size"
                >
                  {{ size }}
                </option>
              </select>
              <div v-else class="text-sm text-center ml-2">
                Нет
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
