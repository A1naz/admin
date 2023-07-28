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
        min: 100,
        max: 30000,
      },
      hideCurrencySymbolOnFocus: false,
      hideGroupingSeparatorOnFocus: false,
      hideNegligibleDecimalDigitsOnFocus: true,
      useGrouping: true,
    }),
  },

})
const { inputRef: rubInput } = useCurrencyInput(props.options)
</script>

<template>
  <input ref="rubInput" class="input input-primary w-full text-lg font-bold" type="text">
</template>
