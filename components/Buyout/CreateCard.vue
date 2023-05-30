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
const emit = defineEmits(['callback', 'remove', 'changeSize', 'changeSex', 'pointModalOpen'])
const { $dayjs } = useNuxtApp()
const router = useRouter()
const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))

async function deleteBuyOut() {
  emit('remove', props.index)
}
function onSizeChange(event: Event) {
  emit('changeSize',
    event,
    props.index,
  )
}
function onSexChange(event: Event) {
  emit('changeSex',
    event,
    props.index,
  )
}
</script>

<template>
  <div class="buyout-card card bg-base-200 shadow-lg">
    <div class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative">
      <div class="dropdown dropdown-end absolute right-2 top-2">
        <label tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <Icon name="ph:dots-three-outline-vertical-fill" size="18" />
        </label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
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
        <BuyoutDateRangePicker v-model="product.dateRange" class="w-32" :start-date="startDate" />
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
        <label
          :for="`modal${index}`" :class="{
            'btn-outline': product.rules,
          }" class="btn btn-primary btn-sm normal-case w-32"
        >{{ 'Настроить' }}
        </label>
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
          <div
            v-for="(query, index) of product.searchQuery"
            :key="index" class="relative flex items-center flex-grow-0 w-full"
          >
            <input
              v-model="product.searchQuery[index]" type="text" placeholder="Поисковый запрос"
              class="input input-bordered input-sm w-full pr-8"
            >
            <div
              v-if="index === 0"
              class="absolute right-0 btn btn-ghost btn-sm btn-square"
              @click="product.searchQuery.push('')"
            >
              <IconCSS size="16" name="ic:round-plus" />
            </div>
            <div
              v-if="index !== 0"
              class="absolute right-0 btn btn-ghost btn-sm btn-square"
              @click="product.searchQuery.splice(index, 1)"
            >
              <IconCSS size="16" name="material-symbols:close" />
            </div>
          </div>
        </div>
      </div>

      <div class="divider" />

      <div class="flex gap-4 items-center">
        <div class="flex items-center flex-none flex-0 flex-shrink-0 h-full" style="width: 130px;">
          <img
            style="object-fit: fill" class="rounded-xl h-full" width="130" height="204"
            :src="product?.image || '/logo/logocolor.svg'"
          >
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
              <div class="absolute left-0 btn btn-ghost btn-sm btn-square" @click="product.quantity--">

                <IconCSS size="16" name="ic:round-minus" />
              </div>
              <input
                v-model="product.quantity" type="number" min="1" max="1000"
                class="input input-bordered input-sm w-full text-center"
              >
              <div class="absolute right-0 btn btn-ghost btn-sm btn-square" @click="product.quantity++">
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
