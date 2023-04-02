<script setup lang="tsx">
import { useMainStore } from '~~/stores/main';
import IconVue from 'nuxt-icon/dist/runtime/IconCSS.vue';
import { useNotification } from "@kyvg/vue3-notification";
import { useWindowSize } from '@vueuse/core'

const { $dayjs } = useNuxtApp();
const currency = useCurrency()

const { width, height } = useWindowSize()
const { notify } = useNotification()
const dp = ref()
const headers = useRequestHeaders(['cookie']) as HeadersInit
definePageMeta({
    layout: 'app',
    auth: true,
    title: 'Добавить выкупы',
})
const selectPointModal = ref() as Ref<HTMLElement>

type Item = {
    image: string,
    name: string,
    article: number,
    price: number,
    priceText: string,
    quantity: number,
    sizes: number[] | string[],
    sex: string,
    searchQuery: string,
    adress: string,
    dateRange: [Date | null, Date | null],
    selectedSize: number | string,
    rules: {
        [key: number]: boolean
    },
}

const defaultRules = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
}
const route = useRoute()
const store = useMainStore();
const article = ref('')
const products = ref<Item[]>([])
const loading = ref(false)
const startDate = useNow()
const addProduct = async () => {
    if (article.value === '') {
        return
    }
    loading.value = true

    const { data, error } = await useFetch(`/api/product/${article.value}`, {
        method: 'GET',
    })
    loading.value = false
    if (error.value) {
        notify({
            title: 'Ошибка',
            text: error.value?.data?.message,
            type: 'error',
        })
    }

    const product = data.value?.product as unknown as Item
    products.value.push(reactive({
        image: product.image,
        name: product.name,
        article: product.article,
        price: product.price,
        quantity: 1,
        sex: 'Нет',
        sizes: product?.sizes,
        dateRange: [startDate.value, null],
        adress: '',
        searchQuery: '',
        selectedSize: product?.sizes[0],
        priceText: product.priceText,
        rules: defaultRules
    }))

}

const onSizeChange = (event: Event, index: number,) => {
    const target = event.target as HTMLInputElement
    products.value[index].selectedSize = Number(target.value)

    console.log(products.value)
}

const onSexChange = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement
    products.value[index].sex = target.value

}

const onRuleChange = (event: Event, index: number, rule: number) => {
    const target = event.target as HTMLInputElement
    products.value[index].rules[rule] = target.checked
}
const removeProduct = (index: number) => {
    products.value.splice(index, 1)
}

const totalSum = computed(() => {
    return products.value.reduce((acc, item) => {
        return acc + item.price * item.quantity
    }, 0)
})
const totalQuantity = computed(() => {
    return products.value.reduce((acc, item) => {
        return acc + item.quantity
    }, 0)
})
const pickpoints = shallowRef()
const modalOpen = ref(false)
const closeModal = () => {
    modalOpen.value = false
}

const handleAddress = (address: string) => {
    const index = store.selectedItem!
    products.value[index].adress = address
}

const createBuyout = async () => {

    let valid = true
    let errorMsg = ''
    products.value.forEach((item) => {
        if (!item.adress) {
            valid = false
            errorMsg = 'Не у всех товаров указан адрес доставки'
        }
        if (!item.dateRange[0] || !item.dateRange[1]) {
            valid = false
            errorMsg = 'Не у всех товаров указаны даты выкупов'
        }
        if (!item.searchQuery) {
            valid = false
            errorMsg = 'Не у всех товаров указан поисковый запрос'
        }
        if (!item.selectedSize) {
            item.selectedSize = 'none'
        }

    })
    if (!valid) {
        notify({
            title: 'Что-то пошло не так',
            text: errorMsg,
            type: 'error',
            duration: 3000,
        })
        return
    }
    const { data, error } = await useFetch('/api/buyout/create', {
        method: 'POST',
        body: JSON.stringify(products.value)
    })
    if (error.value) {
        notify({
            title: 'Что-то пошло не так',
            text: error.value?.data.message,
            type: 'error',
            duration: 3000,
        })
        return
    }
    notify({
        title: 'Выкуп успешно создан',
        type: 'success',
        duration: 3000,
    })
    navigateTo('/buyouts')
}

watch(products.value, (old, value) => {
    value.forEach((item, index) => {
        if (item.quantity < 1) {
            products.value[index].quantity = 1
        }
        if (item.quantity > 1000) {
            products.value[index].quantity = 1000
        }
    })
})

const getPickpoints = async () => {
    try {
        const data = await $fetch('/api/buyout/pickpoints', {
            method: 'GET',
            headers: headers,
        })
        pickpoints.value = (data as any).points
        loading.value = false
    } catch (e: any) {
        notify({
            title: 'Что-то пошло не так',
            text: e?.message,
            type: 'error',
            duration: 3000,
        })
    }
}

const pointModalOpen = async (index: number) => {
    if (!pickpoints.value) {
        loading.value = true
    }
    store.selectedItem = index
    modalOpen.value = true

}
onMounted(async () => {
    getPickpoints()
    if (route.query.uuid) {
        loading.value = true
        const { data, error } = await useFetch(`/api/buyout/clone`, {
            query: {
                uuid: route.query.uuid
            },
            method: 'GET',
            headers: headers
        })
        if (error.value) {
            notify({
                title: 'Что-то пошло не так',
                text: error.value?.data.message,
                type: 'error',
                duration: 3000,
            })
            return
        }
        if (data.value) {
            const product = {
                ...data.value,
                rules: defaultRules,
                dateRange: [startDate.value, null],
            }
            products.value.push(product as any)
        }
        loading.value = false
    }
})

</script>
<template>
    <div>

        <h1 class="text-2xl font-bold mt-1">Добавить выкупы</h1>
        <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
            Создайте новые выкупы. Введите артикулы товаров и заполните необходимые данные.
        </p>
        <div class="mt-6 flex items-center">
            <div class="relative flex justify-end items-center flex-grow-0 w-60">
                <input @keydown.enter="addProduct" type="number" v-model="article" placeholder="Артикул"
                    class="input input-sm input-bordered w-full">
                <button @click="addProduct" class="btn btn-ghost btn-sm absolute normal-case">Добавить</button>
            </div>
        </div>
        <ClientOnly>
            <div v-if="width < 1024" class="products-card grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden mt-4">
                <CreateBuyoutCard :loading="!pickpoints?.length" @point-modal-open="pointModalOpen" @remove="removeProduct"
                    @change-sex="onSexChange" @change-size="onSizeChange" :product="product" :index="index"
                    v-for="(product, index) in products" :key="index" />
            </div>
            <div v-else
                class="products-table hidden lg:block scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin">

                <table class="table table-compact w-full mt-4">
                    <!-- head -->
                    <thead class="relative mb-2">
                        <tr>
                            <th class="">
                                №
                            </th>
                            <th class="w-12">
                                <IconCSS name="material-symbols:image-outline" size="20"></IconCSS>
                            </th>
                            <th class="w-48">
                                Название
                            </th>
                            <th>
                                Цена
                            </th>
                            <th>
                                Количество
                            </th>
                            <th>
                                Размер
                            </th>
                            <th>
                                Пол
                            </th>
                            <th>
                                Поисковый запрос
                            </th>
                            <th class="min-w-40">
                                Адрес
                            </th>
                            <th>
                                Даты выкупов
                            </th>
                            <th>
                                Правила
                            </th>
                        </tr>
                        <progress v-show="loading"
                            class="progress absolute bottom-[-2] mb-2 z-10 progress-primary w-full"></progress>

                    </thead>

                    <tbody v-auto-animate>
                        <tr v-for="(product, index) in products" :key="product.article">
                            <td>
                                {{ index + 1 }}
                            </td>
                            <td>

                                <div
                                    style="width: 28px; height: 36px; overflow: visible; position: relative; border-radius: 4px">
                                    <div class="dropdown dropdown-hover">
                                        <label tabindex="0"> <nuxt-img class="rounded-lg" loading="lazy" fit="fill"
                                                :src="product.image"></nuxt-img>
                                        </label>
                                        <ul tabindex="0"
                                            class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52">
                                            <nuxt-img class="rounded-lg" loading="lazy" fit="fill"
                                                :src="product.image"></nuxt-img>
                                        </ul>
                                    </div>
                                </div>

                            </td>
                            <td class="">
                                <div class="w-48 truncate">
                                    <div class="text-sm font-medium truncate">
                                        {{ product.name }}
                                    </div>
                                    <a :href="`https://www.wildberries.ru/catalog/${product.article}/detail.aspx`"
                                        target="_blank" class="text-sm text-secondary link link-hover">
                                        {{ product.article }}
                                    </a>
                                </div>
                            </td>
                            <td>
                                <div class="text-sm">
                                    {{ product.priceText }}

                                </div>
                            </td>
                            <td>
                                <div class="relative flex items-center flex-grow-0 w-full">
                                    <div @click="product.quantity--"
                                        class="absolute left-0 btn btn-ghost btn-sm btn-square">

                                        <IconCSS size="16" name="ic:round-minus" />
                                    </div>
                                    <input type="number" min="1" max="1000" v-model="product.quantity"
                                        class="input input-bordered input-sm w-full text-center">
                                    <div @click="product.quantity++"
                                        class="absolute right-0 btn btn-ghost btn-sm btn-square">
                                        <IconCSS size="16" name="ic:round-plus" />

                                    </div>

                                </div>
                            </td>
                            <td>
                                <div class="w-20 2xl:w-full flex items-center">
                                    <select @change="onSizeChange($event, index)" v-if="product.sizes.length"
                                        class="select select-sm select-bordered w-full">
                                        <option v-for="size in product.sizes" :selected="product.selectedSize === size"
                                            :key="size" :value="size">{{ size }}</option>
                                    </select>
                                    <div v-else class="text-sm text-center ml-2">
                                        Нет
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="w-20 2xl:w-full">
                                    <select @change="onSexChange($event, index)"
                                        class="select select-sm select-bordered w-full appearance-none">
                                        <option value="none">Нет</option>
                                        <option value="male">Муж</option>
                                        <option value="female">Жен</option>
                                    </select>

                                </div>
                            </td>
                            <td>
                                <div class="w-full">
                                    <input type="text" placeholder="Ввести" class="input input-bordered input-sm w-full"
                                        v-model="product.searchQuery">
                                </div>
                            </td>
                            <td>
                                <div v-auto-animate class="w-full flex flex-col items-start justify-center gap-1">
                                    <div v-if="product.adress" class="text-xs mb-1 truncate w-40"><span>{{ product.adress
                                    }}</span></div>
                                    <button :disabled="!pickpoints" @click="pointModalOpen(index)" :class="{
                                        'btn-outline': product.adress,
                                        'loading': !pickpoints,
                                    }" class="btn btn-primary btn-sm normal-case w-full">{{ product.adress
    ?
    'Изменить' : 'Добавить' }}</button>
                                </div>
                            </td>
                            <td>
                                <div class="flex justify-between items-center">
                                    <div class="w-full">

                                        <DateRangePicker v-model="product.dateRange" :start-date="startDate" />
                                    </div>

                                </div>

                            </td>
                            <td>
                                <div class="w-full flex justify-between">
                                    <label :for="'modal' + index" :class="{
                                        'btn-outline': product.rules,
                                    }" class="btn btn-primary btn-sm normal-case ">{{ 'Настроить' }}
                                    </label>
                                    <div @click="removeProduct(index)" class="ml-2 w-8 btn btn-ghost btn-sm btn-square">
                                        <IconCSS name="material-symbols:close" size="20"></IconCSS>
                                    </div>
                                </div>
                            </td>
                            <Teleport to="body">

                                <input type="checkbox" :id="'modal' + index" class="modal-toggle" />
                                <label :for="'modal' + index" class="modal modal-bottom sm:modal-middle">
                                    <label for="" class="modal-box relative">
                                        <label :for="'modal' + index"
                                            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                                        <h3 class="font-bold text-lg mb-2">Выберите нужные правила для этого выкупа</h3>
                                        <label v-for="(value, key) of products[index].rules" class="label cursor-pointer">
                                            <span class="label-text text-lg">Правило {{ key }}</span>
                                            <input type="checkbox" @change="onRuleChange($event, index, key)"
                                                class="checkbox checkbox-primary" />
                                        </label>
                                    </label>
                                </label>
                            </Teleport>
                        </tr>

                    </tbody>
                    <!-- foot -->

                </table>
            </div>
            <SelectPointModal v-if="modalOpen" :state="modalOpen" @callback="handleAddress" @close="closeModal"
                :pickpoints="pickpoints" />
        </ClientOnly>

        <div class="mt-6 flex justify-between items-center" v-if="products.length">
            <div class="info">
                <div class="text-sm">
                    <span class="text-gray-500">Товаров:</span> <span class="font-bold">{{ totalQuantity
                    }} шт.</span>
                </div>
                <div class="text-sm">
                    <span class="text-gray-500">Сумма:</span> <span class="font-bold">{{ currency.format(totalSum)
                    }}</span>
                </div>
            </div>
            <button @click="createBuyout" class="btn btn-primary btn-sm normal-case">{{ products.length > 1 ? `Создать
                            выкупы` : `Создать выкуп` }}</button>
        </div>

    </div>
</template>



<style scoped>
th {
    @apply normal-case;
}

table td,
table td * {
    vertical-align: top;
}

select {
    /* for Firefox */
    -moz-appearance: none;
    /* for Chrome */
    -webkit-appearance: none;
    appearance: none;
}

/* For IE10 */
select::-ms-expand {
    display: none;
}
</style>