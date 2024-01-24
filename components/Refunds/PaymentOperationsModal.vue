<script setup lang="ts">
const { height } = useWindowSize()
const store = useMainStore()

const props = defineProps({
  paymentOperations: {
    type: Array,
    default: () => [],
  },
  refundType: {
    type: String,
    default: '',
  },
})

const refundType = toRef(props, 'refundType')
const paymentOperations: any = toRef(props, 'paymentOperations')
const isAllOperationsSelected = computed(() => {
  return operations.value.every((operation: any) => operation.selected)
})

watch(refundType, () => {
  selectAllOperations(false)
  paymentOperations.value.forEach((operation: any) => {
    operation.selected = false
  })
})

const operations = computed(() => {
  return paymentOperations.value.filter((operation: any) => {
    if (
      refundType.value == 'Возврат по вине клиента' &&
      operation.type == 'buyouts service'
    ) {
    } else {
      return operation
    }
  })
})


function selectAllOperations(select: boolean) {
  operations.value.forEach((operation: any) => {
    operation.selected = select
  })
}

const emit = defineEmits(['selectOperation'])
</script>

<template>
  <input id="swapAccountModal" type="checkbox" class="modal-toggle" />
  <div
    :class="{
      'modal-open': store.refundsPaymentOperationsModal,
    }"
    class="modal"
  >
    <div class="modal-box max-w-5xl">
      <label
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="store.refundsPaymentOperationsModal = false"
        >✕</label
      >
      <div
        class="my-2 mx-2 overflow-y-auto"
        :style="{ 'max-height': height - 270 + 'px' }"
      >
        <table class="table table-pin-rows">
          <!-- head -->
          <thead>
            <tr>
              <th>id операции</th>
              <th>сумма</th>
              <th>базис операции</th>
              <th>дата</th>
              <th class="flex justify-center">
                <input
                  type="checkbox"
                  :checked="isAllOperationsSelected"
                  @change="selectAllOperations(!isAllOperationsSelected)"
                  class="checkbox checkbox-primary"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->

            <tr v-for="operation in operations" class="hover">
              <th>{{ operation._id }}</th>
              <td>{{ operation.summ }}</td>
              <td>{{ operation.basisoperation }}</td>
              <td>{{ operation.date.split('T')[0] }}</td>
              <td class="flex justify-center">
                <input
                  type="checkbox"
                  :checked="operation.selected"
                  @change="operation.selected = !operation.selected"
                  class="checkbox checkbox-primary"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-action"></div>
    </div>

    <label
      class="modal-backdrop cursor-pointer"
      @click="store.refundsPaymentOperationsModal = false"
      >Close</label
    >
  </div>
</template>

<style scoped></style>
