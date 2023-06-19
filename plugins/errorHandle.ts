export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (err: any) => {
    console.error(err)
  })
})
