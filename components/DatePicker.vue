<script setup lang="ts">
import { useMainStore } from '~~/stores/main'

const props = defineProps({
  modelValue: {
    required: true,
    type: Date,
  },
  size: {
    type: String,
    default: 'small',
  },
})
const emit = defineEmits(['update:modelValue'])
const colorMode = useColorMode()
const { $dayjs } = useNuxtApp()
const { width, height } = useWindowSize()
const startDate = ref(new Date())
const date = ref(props.modelValue)
const store = useMainStore()
type UpdateMonthYear = (month: number, year: number) => void

function updateMonth(event: InputEvent, updateMonthYear: UpdateMonthYear, year: number) {
  updateMonthYear(+(event.target as HTMLSelectElement).value, year)
}
function handleDate(modelData: any) {
  date.value = modelData
  emit('update:modelValue', modelData)
}
</script>

<template>
  <ClientOnly>
    <VueDatePicker
      v-model="date" :teleport-center="width < 1280" :teleport="true" :min-date="startDate"
      :prevent-min-max-navigation="true" :dark="colorMode.value === 'dark'" locale="ru" cancel-text=""
      select-text="Сохранить" @update:model-value="handleDate"
    >
      <template #trigger>
        <div class="flex w-full justify-end">
          <button
            :class="{
              'btn-sm': size === 'small',
              'btn-md': size === 'medium',
            }" class="btn btn-primary normal-case w-30"
          >
            {{
              date ? 'Изменить' : 'Выбрать'
            }}
          </button>
        </div>
      </template>
      <template #action-row="{ internalModelValue, selectDate }">
        <div class="action-row flex flex-col justify-center gap-2 w-full">
          <div class="flex flex-col w-full">
            <div class="flex justify-between">
              <span>Выбрано:</span> <span>{{ $dayjs(internalModelValue).format('D MMMM HH:mm')
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
          // eslint-disable-next-line vue/no-unused-vars
          years,
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
    </VueDatePicker>
  </ClientOnly>
</template>

<style scoped></style>
