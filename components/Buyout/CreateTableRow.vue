<script setup lang="ts">
import { useBuyoutStore } from '../../stores/buyout'
import type { Rule } from '@/data/buyout/rules'

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

const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))

const store = useBuyoutStore()

function copyBuyout() {
  store.createProducts.push(store.createProducts[props.index])
}
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
    queryIndex: index,
    productIndex: props.index,
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
  <tr>
    <td class="hidden 3xl:block">
      {{ index + 1 }}
    </td>
    <td>
      <div
        style="width: 28px; height: 36px; overflow: visible; position: relative; border-radius: 4px"
      >
        <div class="dropdown dropdown-hover">
          <label tabindex="0"> <nuxt-img
            class="rounded-lg" loading="lazy" fit="fill"
            :src="product.image"
          />
          </label>
          <ul
            tabindex="0"
            class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <nuxt-img
              class="rounded-lg" loading="lazy" fit="fill"
              :src="product.image"
            />
          </ul>
        </div>
      </div>
    </td>
    <td class="">
      <div class="w-48 truncate">
        <div class="text-sm font-medium truncate">
          {{ product.name }}
        </div>
        <a
          :href="`https://www.wildberries.ru/catalog/${product.article}/detail.aspx`"
          target="_blank" class="text-sm text-secondary link link-hover"
        >
          {{ product.article }}
        </a>
      </div>
    </td>
    <td>
      <div class="text-sm">
        {{ product.priceText }}
      </div>
    </td>
    <td>
      <div class="relative flex items-center flex-grow-0 w-full">
        <div
          class="absolute left-0 btn btn-ghost btn-sm btn-square"
          @click="productQuantityModel--"
        >
          <IconCSS size="16" name="ic:round-minus" />
        </div>
        <input
          v-model="productQuantityModel" type="number" min="1" max="1000"
          class="input input-bordered input-sm w-full text-center"
        >
        <div
          class="absolute right-0 btn btn-ghost btn-sm btn-square"
          @click="productQuantityModel++"
        >
          <IconCSS size="16" name="ic:round-plus" />
        </div>
      </div>
    </td>
    <td>
      <div class="w-20 2xl:w-full flex items-center">
        <select
          v-if="product.sizes.length" class="select select-sm select-bordered w-full"
          @change="onSizeChange"
        >
          <option
            v-for="size in product.sizes" :key="size"
            :selected="product.selectedSize === size" :value="size"
          >
            {{ size }}
          </option>
        </select>
        <div v-else class="text-sm text-center ml-2">
          Нет
        </div>
      </div>
    </td>
    <td>
      <div class="w-20 2xl:w-full">
        <select
          class="select select-sm select-bordered w-full appearance-none"
          @change="onSexChange"
        >
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
    </td>
    <td>
      <div class="w-full flex flex-col gap-2">
        <BuyoutCreateSearchQueries :product-index="props.index" :article="product.article" :queries="product.searchQuery" @update="productSearchQueryUpdate" @add="addSearchQuery" @remove="removeSearchQuery" />
      </div>
    </td>
    <td class="break-all">
      <div class="w-full flex flex-col items-start justify-center gap-1 flex-wrap overflow-hidden">
        <div v-if="product.adress" class="text-xs mb-1 h-10 w-40 break-all">
          <p class="break-all whitespace-normal">
            {{ product.adress }}
          </p>
        </div>
        <button
          :disabled="loading" :class="{
            'btn-outline': product.adress,
          }" class="btn btn-primary btn-sm normal-case w-full" @click="$emit('pointModalOpen', index)"
        >
          <span v-show="loading" class="loading loading-spinner" />

          {{ product.adress
            ? 'Изменить' : 'Добавить' }}
        </button>
      </div>
    </td>
    <td>
      <div class="flex items-center">
        <div class="w-full">
          <div v-show="product.dateRange[1] && product.dateRange[0]" class="text-sm flex flex-col justify-center items-start mb-2">
            <div>
              {{ `С ${$dayjs(product.dateRange[0]).format('D MMMM HH:mm')}` }}
            </div>
            <div> {{ `По ${$dayjs(product.dateRange[1]).format('D MMMM HH:mm')}` }}</div>
          </div>
          <BuyoutDateRangePicker v-model="productDateRangeModel" :start-date="startDate" />
        </div>
      </div>
    </td>
    <td>
      <div class="w-full">
        <div class="mb-1">
          {{ product.rules.map((rule: Rule) => rule.id).join(', ') }}
        </div>
        <button
          :class="{
            'btn-outline': product.rules,
          }" class="btn btn-primary btn-sm normal-case " @click="$emit('ruleModalOpen', index)"
        >
          {{ 'Настроить' }}
        </button>
      </div>
    </td>
    <td>
      <div class="w-8 btn btn-ghost btn-sm btn-square" @click="copyBuyout">
        <IconCSS name="fluent:copy-20-filled" size="20" />
      </div>
      <div class="w-8 btn btn-ghost btn-sm btn-square" @click="deleteBuyOut">
        <IconCSS name="material-symbols:close" size="20" />
      </div>
    </td>
  </tr>
</template>

<style scoped>

</style>
