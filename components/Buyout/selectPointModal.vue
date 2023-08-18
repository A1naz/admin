<script lang="ts" setup>
import { loadYmap } from 'vue-yandex-maps'

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
const emit = defineEmits(['callback', 'close'])
const store = useMainStore()
function closeModal() {
  emit('close')
}
const loading = ref(false)
const map = ref()
function handleSelect(address: string) {
  emit('callback', address)
  closeModal()
}
const presetCluster = 'islands#violetClusterIcons'

const originalBounds = ref([
  [55.72435065000997, 37.421310551334145],
  [55.79133523378151, 37.83844769733026],
])

const settings = {
  apiKey: '42f2d2d0-5650-479c-aca7-52277719fb42', // Индивидуальный ключ API
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
        geoObjectsArray.forEach(
          (marker: any) => {
            marker.options.set({
              hasBalloon: false,
              preset: 'islands#violetDotIconWithCaption',
              iconOffset: [0, -25],

            })
            marker.properties.set({
              iconCaption: marker.properties._data.name,
            })
          },
        )
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
      hintContentLayout: ymaps.templateLayoutFactory.createClass('Группа объектов'),
    })
    const iconLayout = ymaps.templateLayoutFactory.createClass('<div>$[properties.iconContent]</div>')
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
            <a class="selectPoint mt-4 flex justify-center btn btn-primary">Выбрать</a>
          </div>
        </div>
      `, {
      // First, we call the "build" method of the parent class.
        build() {
          myBalloonContentLayout.superclass.build.call(this)
          this._element.querySelector('.selectPoint').addEventListener('click', this.select)
        },
        clear() {
          this._element.querySelector('.selectPoint').removeEventListener('click', this.select)
          myBalloonContentLayout.superclass.clear.call(this)
        },
        select: () => {
          handleSelect(obj.properties.data.a)
        },
      },
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
  }
  catch (e) {
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
    id="selectPointModal" class="modal" :class="{
      'modal-open': props.state,
    }"
  >
    <div v-if="state" class="modal-box w-11/12 max-w-7xl overflow-y-hidden">
      <div class="">
        <a class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</a>
        <div class="title mb-2">
          Выберите ПВЗ
        </div>
        <div v-if="loading" class="loading flex justify-center items-center h-full">
          <Icon class="animate-spin" size="60" name="mdi:loading" />
        </div>
        <div v-if="error" class="text-lg text-center text-error flex items-center justify-center h-full">
          {{ error }}
        </div>
        <div v-if="!error" class="w-full h-full">
          <div id="ymap" class="yandex-container" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.yandex-container {
  height: 75vh;
  width: 100%;
}

.yandex-balloon {
  height: 200px;
  width: 300px;
}
</style>
