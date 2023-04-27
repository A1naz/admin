<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  state: {
    type: Boolean,
  },
})
const emit = defineEmits(['openModal'])
const { $dayjs } = useNuxtApp()
const currency = useCurrency()
const store = useMainStore()
const router = useRouter()
const opened = ref()
const qrCode = ref(null)
function openBuyout() {
  router.push(`/buyouts?uuid=${props.info.uuid}`)
}
onMounted(async () => {
  opened.value = props.state
})
watch(() => props.state, (newState) => {
  opened.value = newState
})
</script>

<template>
  <div class="collapse collapse-arrow border border-base-200 bg-base-100 rounded-box overflow-visible">
    <input v-model="opened" type="checkbox">
    <div class="collapse-title relative text-xl font-medium">
      <div class="flex gap-4">
        <nuxt-img
          fit="fill" :class="{
            'opacity-0': opened,
          }" :src="info.productimage" width="36"
          class="rounded-lg transition-opacity ease-in-out duration-200 hidden lg:block"
        />
        <div class="w-full">
          <div class="flex justify-between flex-wrap">
            <span> Доставка №{{ info.place }}
            </span>
            <div class="tooltip z-10" data-tip="Перейти к выкупу" @click="openBuyout">
              <label
                class="text-[0.6rem] link link-hover sm:text-[0.8rem] lg:text-xs text-gray-500 hover:text-primary z-10 truncate"
              >#{{
                info.uuid }}</label>
            </div>
          </div>
          <div class="flex justify-between flex-wrap gap-2 items-center">
            <div class="text-sm">
              <span class="text-gray-400">Статус: </span> <span>
                {{ info.currentstatus }}
              </span>
            </div>

            <div class="mt-2 lg:m-0 text-xs">
              Обновлено {{ $dayjs(info.updatedAt).format('D MMMM HH:mm') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="collapse-content">
      <div class="product flex gap-4 lg:gap-8 items-center flex-wrap overflow-visible">
        <div class="dropdown dropdown-hover z-10 static">
          <label tabindex="0"> <nuxt-img
            width="24" class="rounded-lg" loading="lazy" fit="fill"
            :src="info.productimage"
          />
          </label>
          <ul tabindex="0" class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52">
            <nuxt-img class="rounded-lg" loading="lazy" fit="fill" :src="info.productimage" />
          </ul>
        </div>
        <div>
          <div class="text-sm text-gray-500">
            Артикул
          </div>
          <a
            :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
            class=" text-secondary link link-hover"
          >
            {{ info.article }}
          </a>
        </div>
        <div class="truncate w-50">
          <div class="text-sm text-gray-500 ">
            Название
          </div>
          {{ info.productname }}
        </div>
        <div>
          <div class="text-sm text-gray-500">
            Размер
          </div>
          {{ info.size === 'none' ? 'Не указан' : info.size }}
        </div>
        <div class="flex-end">
          <div class="text-sm text-gray-500">
            Цена
          </div>
          {{ currency.format(info.pricebuy) }}
        </div>
      </div>
      <div class="divider" />
      <div class="receipt flex gap-4 lg:gap-8 items-center flex-wrap">
        <div>
          <div class="text-sm text-gray-500">
            Получатель:
          </div>
          {{ info.recipient }} {{ info.recipientphone }}
        </div>
        <div class="w-76 overflow-hidden truncate">
          <div class="text-sm text-gray-500">
            Адрес:
          </div>
          <a
            target="_blank" class="text-secondary link link-hover w-76 truncate "
            :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
          > {{ info.point }}
          </a>
        </div>
        <div>
          <div class="text-sm text-gray-500">
            Код получения:
          </div>
          {{ info?.receiptcode ? info?.receiptcode : 'Товар не доставлен' }}
        </div>
        <div v-if="info.receiptcodeqr">
          <label
            for="qr-modal" class="btn btn-primary btn-sm flex gap-2" @click="emit('openModal',
                                                                                  info.receiptcode,
                                                                                  info.receiptcodeqr,
            )"
          >
            <Icon name="material-symbols:qr-code" size="24" /> <span>QR-код</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
