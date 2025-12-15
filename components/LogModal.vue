<script setup lang="ts">
    const props = defineProps({
      info: {
        type: Object as any,
        required: true,
      },
      mp: {
        type: String,
        default: 'wildberries',
      },
      state: {
        type: Boolean,
        required: true,
      },
    })
    const loading = ref(false)
    const emit = defineEmits(['close'])
    const currency = useCurrency()
    const store = useMainStore()
    const logs = ref<any[]>([])
    async function getLogs() {
      loading.value = true
      //@ts-ignore
      const { data, error } = await useFetch(`/api/tasks/getLogs`, {
        method: 'GET',
        query: {
          uuid: props.info.uuid,
          mp: props.mp,
        },
      })
      if (data.value) logs.value = data.value
      loading.value = false
    }
    watch(
      () => props.info.uuid,
      async () => {
        logs.value = []
        getLogs()
      }
    )
    onKeyStroke('Escape', (e) => {
      e.preventDefault()
      emit('close')
    })
    </script>
    
    <template>
      <div
        id="buyoutLogModal"
        :class="{
          'modal-open': state,
        }"
        class="modal cursor-pointer"
        @click="emit('close')"
      >
        <div @click.stop v-if="state" class="modal-box max-w-2xl cursor-auto">
          <div class="">
            <a
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="$emit('close')"
              >✕</a
            >
            <div class="text-xl font-bold flex items-center gap-2">
              <Icon name="fluent:send-logging-24-filled" />
              <span> Инфо о задаче </span>
            </div>
            <div class="text-xs text-gray-500">#{{ info.uuid }}</div>
    
            <div v-if="logs.length" class="flex flex-col gap-2 mt-2 justify-center">
              <div
                v-for="log of logs"
                :key="log._id"
                class="log p-2 bg-base-200 rounded-lg flex justify-between gap-4 items-start"
              >
                <div class="logText w-2/3">
                  {{ log.text }}
                </div>
                <div class="logDate">
                  {{ defaultDate(log.date) }}
                </div>
              </div>
            </div>
            <div v-else-if="loading" class="hero">
              <span class="loading loading-dots loading-lg text-primary"></span>
            </div>
            <Hero v-else />
          </div>
        </div>
      </div>
    </template>
    
    <style scoped></style>
    