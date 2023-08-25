<script setup lang="ts">
interface Props {
  state: Boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])
const { $dayjs } = useNuxtApp()
const currency = useCurrency()
const store = useMainStore()

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})
</script>

<template>
  <div
    id="buyoutLogModal" :class="{
      'modal-open': state,
    }" class="modal"
  >
    <div v-if="state" class="modal-box max-w-2xl">
      <div class="">
        <a class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('close')">✕</a>
        <div>
          В связи с новыми правилами продвижения на Wildberries:
          <ul>
            <li>
              1. Осуществляйте заборы до 5 дней с момента прибытия на ПВЗ.
              В случае не забора в указанные сроки, вам будет начисляться штраф в 25 рублей ежедневно за каждую единицу товара.
            </li>
            <li>
              2. Отказы от товара на ПВЗ запрещены!
              Деньги не возвращаются на баланс аккаунта внутри нашей платформы, на сегодняшний день.
            </li>
          </ul>
          <div>
            По всем вопросам, пишите в службу заботы.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
