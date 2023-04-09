<script lang="ts" setup>
const { signIn } = useSession()
definePageMeta({ auth: false })
</script>

<template>
  <section class="">
    <div class="md:h-screen lg:py-0">
      <div class="navbar bg-base-100 px-8">
        <div class="flex-1">
          <Logo />
        </div>
        <div class="navbar-end flex gap-4">
          <NuxtLink to="/auth" class="primary text-sm">
            Вход
          </NuxtLink>
          <NuxtLink to="/register" class="btn btn-primary btn-sm font-medium normal-case text-white">
            Регистрация
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
