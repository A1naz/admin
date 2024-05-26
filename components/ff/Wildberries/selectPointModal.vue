<script lang="ts" setup>
import { loadYmap } from 'vue-yandex-maps'
import { notify } from '@kyvg/vue3-notification'

const { height } = useWindowSize()
const config = useRuntimeConfig()

const props = defineProps({
  pickpoints: {
    type: Array,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
})
const lastAddress = ref({
  lt: 0,
  lg: 0,
  id: '',
  w: '',
})

const emit = defineEmits(['callback', 'close'])

function closeModal() {
  emit('close')
}
const loading = ref(false)
const map = ref()
function handleSelect(address: string) {
  const item: any = props.pickpoints.find((item: any) => item.a === address)

  if (!item) {
    return notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Этот пункт выдачи не найден',
    })
  }

  let pointStore: any = localStorage.getItem('wildberriesPointStore')

  const arr = JSON.parse(pointStore) || []

  if (arr.length > 20) arr.splice(arr.length - 1, 1)
  if (
    !arr.find(
      (el: any) => el.id === item.id && el.lg === item.lg && el.lt === item.lt
    )
  ) {
    arr.unshift({
      address,
      lt: item.lt,
      lg: item.lg,
      id: item.id,
      w: item.w,
    })
  }

  localStorage.setItem('wildberriesPointStore', JSON.stringify(arr))
  emit('callback', address, item.lt, item.lg, item.id, item.w)
  closeModal()
}

function handleDelete(address: any) {
  let pointStore: any = localStorage.getItem('wildberriesPointStore')
  const arr = JSON.parse(pointStore) || []
  arr.splice(
    arr.indexOf(arr.find((el: any) => el.address === address.address)),
    1
  )
  localStorage.setItem('wildberriesPointStore', JSON.stringify(arr))
  emit(
    'callback',
    address.address,
    lastAddress.value.lt,
    lastAddress.value.lg,
    lastAddress.value.id
  )
  lastPoints.value = JSON.parse(
    localStorage.getItem('wildberriesPointStore') || '[]'
  )
}

const lastPoints = ref(
  JSON.parse(localStorage.getItem('wildberriesPointStore') || '[]')
)
const presetCluster = 'islands#violetClusterIcons'

const originalBounds = ref([
  [55.72435065000997, 37.421310551334145],
  [55.79133523378151, 37.83844769733026],
])

const settings = {
  apiKey: config.public.YANDEX_MAPS_API_KEY || '', // Индивидуальный ключ API
  lang: 'ru_RU', // Используемый язык
  coordorder: 'latlong', // Порядок задания географических координат
  debug: false, // Режим отладки
  version: '2.1', // Версия Я.Карт
}
const error = ref()

onMounted(async () => {
  try {
    loading.value = true
    await loadYmap(settings)
    await ymaps.ready
    const myMap = new ymaps.Map('ymap', {
      center: [55.76, 37.64],
      zoom: 7,
      controls: [],
    })
    map.value = myMap
    const searchControl = new ymaps.control.SearchControl({
      options: {
        provider: 'yandex#map',
        noPlacemark: true,
      },
    })
    searchControl.events.add('resultselect', (event: any) => {
      if (!event.get('skip') && searchControl.getResultsCount()) {
        const geoObjectsArray = searchControl.getResultsArray()
        geoObjectsArray.forEach((marker: any) => {
          marker.options.set({
            hasBalloon: false,
            preset: 'islands#violetDotIconWithCaption',
            iconOffset: [0, -25],
          })
          marker.properties.set({
            iconCaption: marker.properties._data.name,
          })
        })
      }
    })
    myMap.controls.add(searchControl)
    myMap.setBounds(originalBounds.value)
    const objectManager = new ymaps.ObjectManager({
      // Включаем кластеризацию.
      clusterize: true,
      // Опции кластеров задаются с префиксом 'cluster'.
      clusterHasBalloon: false,
      // Опции геообъектов задаются с префиксом 'geoObject'.
      geoObjectOpenBalloonOnClick: false,
    })

    // Опции можно задавать напрямую в дочерние коллекции.
    objectManager.clusters.options.set({
      preset: presetCluster,
      hintContentLayout:
        ymaps.templateLayoutFactory.createClass('Группа объектов'),
    })
    const iconLayout = ymaps.templateLayoutFactory.createClass(
      '<div>$[properties.iconContent]</div>'
    )
    const collection = {
      type: 'FeatureCollection',
      features: props.pickpoints.map((point: any, index: number) => {
        return {
          type: 'Feature',
          id: index,
          geometry: {
            type: 'Point',
            coordinates: [point.lt, point.lg],
            radius: 1000,
          },
          properties: {
            iconContent: 'WB',
            data: {
              a: point.a,
              w: point.w,
            },
          },
          options: {
            iconColor: '#8d297f',
            iconLayout: 'default#image',
            iconImageHref: '/img/pin-map.svg',
            iconimageoffset: [-5, -38],
            iconImageSize: [32, 32],
            iconOffset: [0, 0],
            iconShadow: true,
          },
        }
      }),
    }

    objectManager.add(collection)

    // Добавляем коллекцию на карту.
    myMap.geoObjects.add(objectManager)

    objectManager.objects.events.add('click', (e: any) => {
      const objectId = e.get('objectId')
      const obj = objectManager.objects.getById(objectId)

      const myBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        `<div class="card rounded-lg">
          <div>
            <div class="text-lg font-semibold">Пункт выдачи Wildberries</div>
            <div class="text-sm">${obj.properties.data.a}</div>
            <div class="text-sm">${obj.properties.data.w}</div>
            <a class="selectPoint mt-4 flex justify-center btn btn-primary hover:bg-primary">Выбрать</a>
          </div>
        </div>
      `,
        {
          // First, we call the "build" method of the parent class.
          build() {
            myBalloonContentLayout.superclass.build.call(this)
            this._element
              .querySelector('.selectPoint')
              .addEventListener('click', this.select)
          },
          clear() {
            this._element
              .querySelector('.selectPoint')
              .removeEventListener('click', this.select)
            myBalloonContentLayout.superclass.clear.call(this)
          },
          select: () => {
            handleSelect(obj.properties.data.a)
          },
        }
      )
      // set this layout as a custom balloon content layout
      objectManager.objects.setObjectOptions(objectId, {
        balloonContentLayout: myBalloonContentLayout,
        balloonPanelMaxMapArea: 0,
      })
      objectManager.objects.balloon.open(objectId)
    })
    // создаем кастомный балун
    objectManager.objects.events.add('balloonopen', (e: any) => {
      const objectId = e.get('objectId')
      const geoObject = objectManager.objects.getById(objectId)
    })
    loading.value = false
  } catch (e) {
    loading.value = false
    // eslint-disable-next-line no-console
    console.log(e)
    error.value = 'Не удалось загрузить карту'
  }
})

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
  <div
    id="selectPointModal"
    class="modal"
    :class="{
      'modal-open': props.state,
    }"
  >
    <div v-if="state" class="modal-box w-11/12 max-w-4xl">
      <div class="">
        <a
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="closeModal"
          >✕</a
        >
        <div class="title mb-2">Выберите ПВЗ</div>
        <div
          v-if="loading"
          class="loading flex justify-center items-center h-full"
        >
          <Icon class="animate-spin" size="60" name="mdi:loading" />
        </div>
        <div
          v-if="error"
          class="text-lg text-center text-error flex items-center justify-center h-full"
        >
          {{ error }}
        </div>
        <div
          v-if="!error"
          class="flex-row md:flex md:flex-row gap-4 min-h-112 md:h-full"
        >
          <div class="w-full h-full">
            <div id="ymap" class="yandex-container rounded-lg" />
          </div>
          <div class="last md:h-full rounded-lg p-2 max-w-xs">
            <h2 class="font-bold">Последние использованные ПВЗ</h2>
            <div
              class="flex flex-col gap-2 mt-2 overflow-y-auto overflow-x-hidden"
              :style="`height: ${height - height / 3.3}px`"
            >
              <div
                v-if="
                  lastPoints && lastPoints.length > 0 && lastPoints[0] !== ''
                "
                v-for="(item, index) of lastPoints"
                class="w-full flex flex-row pr-1"
              >
                <button
                  :key="index"
                  class="btn pvz text-xs rounded-none h-16 rounded-l-md p-2 flex w-10/12 text-left"
                  @click="handleSelect(item.address)"
                >
                  {{ item.address }}
                </button>
                <button
                  class="btn btn-square rounded-none rounded-r-md h-16"
                  @click="handleDelete(item)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop cursor-pointer" @click="closeModal"></div>
  </div>
</template>

<style>
.yandex-container {
  height: 75vh;
  width: 100%;
  border-radius: 20px; /* Установите желаемый радиус скругления углов */
  overflow: hidden;
}

.yandex-balloon {
  height: 200px;
  width: 300px;
}

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
  border-radius: 4px;
}
</style>
