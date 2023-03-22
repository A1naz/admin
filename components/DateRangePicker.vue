
<script setup lang="ts">
import { useMainStore } from '~~/stores/main';

const { $dayjs } = useNuxtApp();
const props = defineProps({
    modelValue: {
        required: true,
        type: Array
    },
    startDate: {
        required: true,
        type: Date
    }
})
const emit = defineEmits(['update:modelValue'])
const date = ref(props.modelValue)
const store = useMainStore()
const getFirstDate = (dates: [Date | null, Date | null] | []) => {
    if (dates && dates[0]) {
        return `${$dayjs(dates[0]).format('D MMMM HH:mm')}`
    }
    return ''
}
const getSecondDate = (dates: [Date | null, Date | null] | []) => {
    if (dates && dates[1]) {
        return `${$dayjs(dates[1]).format('D MMMM HH:mm')}`

    }
    return ''
}
type UpdateMonthYear = (month: number, year: number) => void;

const updateMonth = (event: InputEvent, updateMonthYear: UpdateMonthYear, year: number) => {
    updateMonthYear(+(event.target as HTMLSelectElement).value, year);
};
const handleDate = (modelData: any) => {
    date.value = modelData
    console.log(date.value)
    emit('update:modelValue', modelData)
}
</script>
<template>
    <div>
        <VueDatePicker class="absolute" @update:model-value="handleDate" v-model="date" ref="dp" :min-date="startDate"
            :prevent-min-max-navigation="true" :dark="store.theme === 'dracula'" locale="ru" range cancelText=""
            select-text="Сохранить">
            <template #trigger>
                <button :class="{
                    'btn-outline': date[0] && date[1],
                }" class="btn btn-primary btn-sm normal-case w-full">{{
    date[0] && date[1] ? 'Изменить' : 'Выбрать'
}}</button>
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
                    <button class="btn btn-primary btn-sm block normal-case" @click="selectDate">Применить</button>
                </div>
            </template>
            <template #month-year="{
                month,
                year,
                months,
                years,
                updateMonthYear,
                handleMonthYearChange
            }">
                <div class="icons flex justify-between w-full items-center">
                    <span class="custom-icon btn btn-ghost btn-sm btn-square" @click="handleMonthYearChange(false)">
                        <Icon name="material-symbols:chevron-left-rounded" size="16"></Icon>
                    </span>
                    <div class="custom-month-year-component">
                        <select class="select select-ghost select-sm" :value="month"
                            @change="updateMonth($event as any, updateMonthYear, year)">
                            <option v-for="m in months" :key="m.value" :value="m.value">{{
                                m.text }}</option>
                        </select>
                    </div>
                    <span class="custom-icon btn btn-ghost btn-sm btn-square" @click="handleMonthYearChange(true)">
                        <Icon name="material-symbols:chevron-right-rounded" size="16">
                        </Icon>
                    </span>
                </div>
            </template>
        </VueDatePicker>
    </div>
</template>


<style scoped></style>