import { defineNuxtRouteMiddleware } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
  const { status } = useAuth()
  if (status.value === 'authenticated') {
    if (to.path === '/auth' || to.path === '/register' || to.path === '/')
      return navigateTo('/buyouts')
  }
  else {
    if (to.path === '/')
      return navigateTo('/auth')
  }
})
