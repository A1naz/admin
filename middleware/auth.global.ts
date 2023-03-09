export default defineNuxtRouteMiddleware((to, from) => {
  const { status } = useSession()
  if (status.value === 'authenticated') {
    console.log(to.path)
    if (to.path === '/auth' || to.path === '/register') {
      return navigateTo('/buyouts')
    }
  }
})
