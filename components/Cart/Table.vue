<script setup lang="ts">
interface IProps {
  carts: any[]
  getStatus: (status: string) => string
}
const props = defineProps<IProps>()
const { $dayjs } = useNuxtApp()
</script>

<template>
  <ClientOnly>
    <DataTable class="bg-base-200 hidden lg:block" :value="carts">
      <Column field="place" header="№" />
      <Column field="image" header="Фото">
        <template #body="{ data }">
          <div
            style="width: 28px; height: 36px; overflow: visible; position: relative; border-radius: 4px"
          >
            <div class="dropdown dropdown-hover">
              <label tabindex="0"> <nuxt-img
                class="rounded-lg z-0" alt="" loading="lazy" fit="fill"
                :src="data.image"
              />
              </label>
              <ul
                tabindex="0"
                class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
              >
                <nuxt-img
                  class="rounded-lg z-[1]" loading="lazy" fit="fill"
                  :src="data.image"
                />
              </ul>
            </div>
          </div>
        </template>
      </Column>
      <Column field="article" header="Артикул">
        <template #body="{ data }">
          <a
            :href="`https://www.wildberries.ru/catalog/${data.article}/detail.aspx`" target="_blank"
            class="text-sm text-secondary link link-hover"
          >
            {{ data.article }}
          </a>
        </template>
      </Column>
      <Column field="size" header="Размер">
        <template #body="{ data }">
          <div>{{ data.size }}</div>
        </template>
      </Column>
      <Column field="amount" header="Кол-во">
        <template #body="{ data }">
          <div>{{ data.amount }}</div>
        </template>
      </Column>
      <Column field="query" header="Ключевой запрос">
        <template #body="{ data }">
          <p class="max-w-xs truncate">
            {{ data.query }}
          </p>
        </template>
      </Column>

      <Column field="status" header="Статус">
        <template #body="{ data }">
          <div
            :class="{
              'text-error': data.status === 'nofunds',
              'text-primary': data.status === 'created',
              'text-warning': data.status === 'work',
              'text-success': data.status === 'completed',
            }"
          >
            {{ getStatus(data.status) }}
          </div>
        </template>
      </Column>
      <Column field="createdDate" header="Дата создания">
        <template #body="{ data }">
          <div>
            {{ $dayjs(data.createdDate).format('D MMMM HH:mm') }}
          </div>
        </template>
      </Column>
      <Column field="endedDate" header="Дата завершения">
        <template #body="{ data }">
          <div v-if="data.endedDate">
            {{ $dayjs(data.endedDate).format('D MMMM HH:mm') }}
          </div>
          <div v-else>
            Нет
          </div>
        </template>
      </Column>
    </DataTable>
  </ClientOnly>
</template>

<style scoped>

</style>
