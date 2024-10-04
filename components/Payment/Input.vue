<script setup lang="ts">
import type { CurrencyInputOptions } from 'vue-currency-input'
import { useCurrencyInput } from 'vue-currency-input'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  options: {
    type: Object as PropType<CurrencyInputOptions>,
    default: () => ({
      locale: 'ru-RU',
      currency: 'RUB',
      currencyDisplay: 'symbol',
      valueRange: {
        min: 1,
        max: 9999999999,
      },
      hideCurrencySymbolOnFocus: false,
      hideGroupingSeparatorOnFocus: false,
      precision: 0,
      hideNegligibleDecimalDigitsOnFocus: true,
      useGrouping: true,
    }),
  },
})
const { inputRef: rubInput, setValue } = useCurrencyInput(props.options)

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      setValue(value)
    } else {
      setValue(1)
    }
  }
)
</script>

<template>
  <input
    ref="rubInput"
    class="input input-primary w-full text-lg font-bold"
    type="text"
  />
</template>
