<script setup lang="ts">
definePageMeta({
    layout: 'app',
    auth: true,
    breadcrumb: ['Профиль'],
})

const store = useMainStore();




const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
})
onMounted(async () => {
    form.firstName = store.client.firstName
    form.lastName = store.client.lastName
    form.email = store.client.email
    form.username = store.client.username
    console.log(store.client.firstName)
})
const headers = useRequestHeaders(['cookie']) as HeadersInit

const update = async () => {
    const { data, error } = await useFetch('/api/user/update', {
        method: 'POST',
        body: JSON.stringify(form),
        headers,
    })
    if (error) {
        console.log(error)
    } else {
        console.log(data)
    }
}
</script>
<template>
    <div>
        <div class="page-header mb-16">
            <h1 class="title">Профиль</h1>
            <p class="description">
                Здесь вы можете управлять настройками вашего аккаунта.
            </p>
        </div>
        <section
            class="profile-options flex flex-col justify-center items-center gap-6 lg:gap-24 lg:flex-row lg:justify-between lg:items-start">
            <div class="description-container lg:basis-1/3">
                <div class="heading">Контактные данные</div>
                <div class="text-xs text-gray-400">Заполните свои контактные данные, чтобы получать актуальные рекомендации
                    по
                    продвижению</div>
            </div>
            <div class="flex flex-col gap-8 w-full mt-1">
                <div class="w-full flex gap-8">
                    <input v-model="form.firstName" placeholder="Имя" class="input input-bordered w-full">
                    <input v-model="form.lastName" placeholder="Фамилия" class="input input-bordered w-full">
                </div>

                <div class="email flex gap-8">
                    <input v-model="form.username" type="text" placeholder="Логин" class="input input-bordered w-full">
                    <input v-model="form.email" type="text" placeholder="Почта (email)"
                        class="input input-bordered w-full" />
                </div>

                <div class="tg w-full flex gap-2 lg:gap-6">
                    <input :value="store.client.telegram ? `@${store.client.telegram}` : ''" placeholder="Telegram"
                        class="input input-bordered w-3/4 lg:w-1/4" disabled />
                    <button :disabled="store.client.telegram" class="btn btn-primary w-1/4 lg:w-1/5">{{
                        store.client.telegram ?
                        'Привязан'
                        : 'Привязать' }}</button>
                </div>


                <button @click="update" class="btn btn-primary lg:w-40 mr-0 self-end">Сохранить</button>
            </div>
        </section>
    </div>
</template>



<style scoped></style>