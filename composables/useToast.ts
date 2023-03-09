export const useToast = (alert: Ref<boolean>) => {
  const { isPending, start, stop } = useTimeoutFn(() => {
    alert.value = false
  }, 3000)
}
