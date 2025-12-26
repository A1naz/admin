import { LoginAttempt } from '@/server/lib/models/LoginAttempt'

// 🔧 DEV ONLY: Очистка всех попыток логина для тестирования
export default eventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  
  // Только в dev режиме!
  if (runtimeConfig.env === 'production') {
    throw createError({
      statusCode: 403,
      message: 'Доступно только в dev режиме'
    })
  }

  const { email } = getQuery(event)

  if (email) {
    // Очистить для конкретного email
    const result = await LoginAttempt.deleteMany({
      identifier: (email as string).toLowerCase().trim()
    })
    
    return {
      status: 'ok',
      message: `Очищено ${result.deletedCount} попыток для ${email}`,
      deletedCount: result.deletedCount
    }
  } else {
    // Очистить все попытки
    const result = await LoginAttempt.deleteMany({})
    
    return {
      status: 'ok',
      message: `Очищено ${result.deletedCount} попыток`,
      deletedCount: result.deletedCount
    }
  }
})

