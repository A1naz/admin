<script setup lang="ts">
import { useMainStore } from '~~/stores/main'

const props = defineProps({
  modelValue: {
    required: true,
    type: Array,
  },
  startDate: {
    required: true,
    type: Date,
  },
})
const emit = defineEmits(['update:modelValue'])
const colorMode = useColorMode()
const { $dayjs } = useNuxtApp()
const { width } = useWindowSize()
const date = ref(props.modelValue)
const store = useMainStore()
function getFirstDate(dates: [Date | null, Date | null] | []) {
  if (dates && dates[0])
    return `${$dayjs(dates[0]).format('D MMMM HH:mm')}`

  return ''
}
function getSecondDate(dates: [Date | null, Date | null] | []) {
  if (dates && dates[1])
    return `${$dayjs(dates[1]).format('D MMMM HH:mm')}`

  return ''
}
type UpdateMonthYear = (month: number, year: number) => void
type updateTime = (time: number[], hours: boolean) => void

function updateMonth(event: InputEvent, updateMonthYear: UpdateMonthYear, year: number) {
  updateMonthYear(+(event.target as HTMLSelectElement).value, year)
}
const hoursArray = computed(() => {
  const arr = []
  for (let i = 0; i < 24; i++)
    arr.push({ text: i < 10 ? `0${i}` : i, value: i })

  return arr
})

const minutesArray = computed(() => {
  const arr = []
  for (let i = 0; i < 60; i++)
    arr.push({ text: i < 10 ? `0${i}` : i, value: i })

  return arr
})
function handleDate(modelData: any) {
  const first = modelData[0] as Date
  const second = modelData[1] as Date
  if (second.getHours() < first.getHours())
    second.setHours(first.getHours())
  if (second.getMinutes() < first.getMinutes())
    second.setMinutes(first.getMinutes())
  first.setHours(9)
  second.setHours(20)
  date.value = [first, second]
  emit('update:modelValue', modelData)
}
function handleTime(index: number, value: number, hours = true, updateTime: updateTime, time: any) {
  if (index === 0)
    updateTime([value, time.hours[1]], true)
  else
    updateTime([time.hours[0], value], true)
}
</script>

<template>
  <div>
    <VueDatePicker
      v-model="date" position="left" :teleport-center="width < 1024"
      :teleport="true" :min-date="startDate" :prevent-min-max-navigation="true" :dark="colorMode.value === 'dark'"
      :time-picker-inline="true"
      locale="ru" range cancel-text="" select-text="Сохранить" @update:model-value="handleDate"
    >
      <template #trigger>
        <button
          :class="{
            'btn-outline': date[0] && date[1],
          }" class="btn btn-primary btn-sm normal-case w-full"
        >
          {{
            date[0] && date[1] ? 'Изменить' : 'Выбрать'
          }}
        </button>
      </template>
      <template #action-row="{ internalModelValue, selectDate }">
        <div class="action-row flex flex-col justify-center gap-2 w-full">
          <div class="flex flex-col w-full">
            <div class="flex justify-between">
              <span>Начало:</span> <span>{{ getFirstDate(internalModelValue)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span>Конец:</span> <span>{{ getSecondDate(internalModelValue)
              }}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-sm block normal-case" @click="selectDate">
            Применить
          </button>
        </div>
      </template>
      <template
        #month-year="{
          month,
          year,
          months,
          updateMonthYear,
          handleMonthYearChange,
        }"
      >
        <div class="icons flex justify-between w-full items-center">
          <span class="custom-icon btn btn-ghost btn-sm btn-square" @click="handleMonthYearChange(false)">
            <Icon name="material-symbols:chevron-left-rounded" size="16" />
          </span>
          <div class="custom-month-year-component">
            <select
              class="select select-ghost select-sm" :value="month"
              @change="updateMonth($event as any, updateMonthYear, year)"
            >
              <option v-for="m in months" :key="m.value" :value="m.value">
                {{
                  m.text }}
              </option>
            </select>
          </div>
          <span class="custom-icon btn btn-ghost btn-sm btn-square" @click="handleMonthYearChange(true)">
            <Icon name="material-symbols:chevron-right-rounded" size="16" />
          </span>
        </div>
      </template>
      <template #clock-icon>
        <div class="flex justify-center items-center gap-2">
          <Icon name="fluent:clock-24-regular" />
          <div class="text-base-content">
            Указать время
          </div>
        </div>
      </template>
      <template #time-picker="{ time, updateTime }">
        <div class="custom-time-picker-component">
          <span class="text-center px-2">Укажите часы</span>
          <div class="flex items-center gap-2 px-2 pt-1">
            <select
              class="select select-sm w-full"
              :value="time.hours[0]"
              @change="handleTime(0, +$event.target.value, true, updateTime, time)"
            >
              <option
                v-for="h in hoursArray"
                :key="h.value"
                :value="h.value"
              >
                {{ h.text }}
              </option>
            </select>
            <select
              class="select select-sm w-full"
              :value="time.hours[1]"
              @change="handleTime(1, +$event.target.value, true, updateTime, time)"
            >
              <option
                v-for="h in hoursArray"
                :key="h.value"
                :value="h.value"
              >
                {{ h.text }}
              </option>
            </select>
          </div>
        </div>
      </template>
    </VueDatePicker>
  </div>
</template>

<style scoped>

</style>
