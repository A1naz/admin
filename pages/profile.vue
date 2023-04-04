<script setup lang="ts">
definePageMeta({
    layout: 'app',
    auth: true,
    title: 'Профиль',
})

const store = useMainStore();




const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
})
const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
})
const alert = reactive({
    show: false,
    message: '',
    type: 'success',
})
const { start, stop } = useTimeoutFn(() => {
    alert.show = false
}, 3000, { immediate: false })
const initialForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
})
onMounted(async () => {
    console.log(store.client)
    initialForm.firstName = store.client.firstName
    initialForm.lastName = store.client.lastName
    initialForm.email = store.client.email
    initialForm.username = store.client.username
    form.firstName = store.client.firstName
    form.lastName = store.client.lastName
    form.email = store.client.email
    form.username = store.client.username
    console.log(store.client.firstName)
})
const headers = useRequestHeaders(['cookie']) as HeadersInit
const disabledSaveButton = computed(() => {
    return form.firstName == initialForm.firstName && form.lastName == initialForm.lastName && form.email == initialForm.email && form.username == initialForm.username
})
const disabledChangePasswordButton = computed(() => {
    if (store.client.hasPassword) {
        return passwordForm.oldPassword == '' || passwordForm.newPassword == ''
    } else {
        return passwordForm.newPassword == ''
    }
})

const updatePassword = async () => {
    if (passwordForm.oldPassword == '' && passwordForm.newPassword == '') {
        return
    }
    const { data, error } = await useFetch('/api/user/updatePassword', {
        method: 'POST',
        body: JSON.stringify(passwordForm),
        headers,
    })
    if (data.value?.status === 'error') {
        alert.show = true
        alert.message = data.value.error!
        alert.type = 'error'
    } else {
        alert.show = true
        alert.message = 'Пароль успешно изменен'
        alert.type = 'success'
    }
    start()
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    await store.getClient()
}
const update = async () => {
    if (form.firstName == store.client.firstName && form.lastName == store.client.lastName && form.email == store.client.email && form.username == store.client.username) {
        return
    }

    const { data, error } = await useFetch('/api/user/update', {
        method: 'POST',
        body: JSON.stringify(form),
        headers,
    })
    if (error.value) {
        alert.show = true
        alert.message = error.value?.data?.message
        alert.type = 'error'
    } else {
        alert.show = true
        alert.message = 'Данные успешно обновлены'
        alert.type = 'success'
    }
    start()
    await store.getClient()
}
const unlinkTelegram = async () => {
    const { data, error } = await useFetch('/api/user/unlinkTelegram', {
        method: 'POST',
        headers,
    })
    if (error.value) {
        alert.show = true
        alert.message = error.value?.data?.message
        alert.type = 'error'
    } else {
        alert.show = true
        alert.message = 'Telegram аккаунт успешно отвязан'
        alert.type = 'success'
    }
    start()
    await store.getClient()
}
const onTelegramLink = (data: any) => {
    console.log(data)
    if (data.status === 'ok') {
        alert.show = true
        alert.message = 'Telegram аккаунт успешно привязан'
        alert.type = 'success'
    } else {
        alert.show = true
        alert.message = data.error.data?.message || 'Произошла ошибка'
        alert.type = 'error'
    }
    start()

}
</script>
<template>
    <div>
        <Toast :type="alert.type" :active="alert.show">{{ alert.message }}</Toast>
        <div class="page-header mb-16">
            <h1 class="title">Профиль</h1>
            <p class="description">
                Здесь вы можете управлять настройками вашего аккаунта.
            </p>
        </div>
        <section
            class="profile-options flex flex-col justify-center items-center gap-6 lg:gap-32 lg:pr-12 lg:flex-row lg:justify-between lg:items-start">
            <div class="self-start description-container lg:basis-1/3">
                <div class="heading">Контактные данные</div>
                <div class="text-xs text-gray-400">Заполните свои контактные данные, чтобы получать актуальные рекомендации
                    по
                    продвижению</div>
            </div>
            <div class="flex flex-col gap-6 w-full mt-1">
                <div class="w-full flex gap-8">
                    <input v-model="form.firstName" placeholder="Имя" class="input input-bordered w-full">
                    <input v-model="form.lastName" placeholder="Фамилия" class="input input-bordered w-full">
                </div>

                <div class="email flex flex-col gap-8 lg:flex-row">
                    <input v-model="form.username" type="text" placeholder="Никнейм" class="input input-bordered w-full">
                    <input v-model="form.email" type="text" placeholder="Почта (email)"
                        class="input input-bordered w-full" />
                </div>
                <div class="flex w-full gap-4 justify-between">
                    <div class="tg w-full justify-between flex gap-2 lg:gap-4 lg:w-1/2 д">
                        <div class="relative flex justify-end w-full items-center flex-grow-0">
                            <input :value="store.client?.telegram ? `@${store.client.telegram}` : ''" placeholder="Telegram"
                                class="input input-bordered w-full" disabled>
                            <Icon class="absolute mr-4" size="24" name="logos:telegram" />

                        </div>

                        <LinkTelegram v-if="!store.client.telegram" @callback="onTelegramLink" class="lg:mr-4">
                        </LinkTelegram>
                        <button v-if="store.client.telegram" @click="unlinkTelegram"
                            class="btn btn-primary lg:mr-4">Отвязать</button>


                    </div>
                    <button :disabled="disabledSaveButton" @click="update"
                        class="btn btn-primary  lg:w-40 mr-0 self-end">Сохранить</button>

                </div>




            </div>

        </section>
        <section
            class="profile-options mt-20 flex flex-col justify-center items-center gap-6 lg:gap-32 lg:pr-12 lg:flex-row lg:justify-between lg:items-start">
            <div class="self-start description-container lg:basis-1/3">
                <div class="heading">Пароль</div>
                <div class="text-xs text-gray-400">Установите или поменяйте пароль для вашего аккаунта</div>
            </div>
            <div class="flex flex-col gap-6 w-full mt-1">
                <div class="w-full flex gap-8">
                    <input v-show="store.client.hasPassword" type="password" v-model="passwordForm.oldPassword"
                        placeholder="Старый пароль" class="input input-bordered w-full">
                    <input type="password" v-model="passwordForm.newPassword" placeholder="Новый пароль"
                        class="input input-bordered w-full">
                </div>


                <button :disabled="disabledChangePasswordButton" @click="updatePassword"
                    class="btn btn-primary lg:w-40 mr-0 self-end">{{ store.client.hasPassword ? 'Изменить' :
                        'Сохранить' }}</button>
            </div>

        </section>
    </div>
</template>



<style scoped></style>