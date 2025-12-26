import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import confirmTwoFaCode from '~/server/utils/confirmTwoFaCode'
import { checkRateLimit, logLoginAttempt } from '~/server/utils/rateLimiter'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { code }: any = getQuery(event)
  
  if (!code || !/^\d{6}$/.test(code)) {
    throw createError({
      statusCode: 400,
      message: 'Неверный формат кода',
    })
  }

  // ✅ FIX: Rate limiting для защиты от brute force
  const identifier = `2fa_${user.uuid}`
  const rateLimitCheck = await checkRateLimit(event, identifier)
  if (!rateLimitCheck.allowed) {
    await logLoginAttempt(event, identifier, false)
    throw createError({
      statusCode: 429,
      message: rateLimitCheck.reason || 'Слишком много попыток. Попробуйте позже.',
    })
  }

  if (!user.twoFaSecret) {
    throw createError({
      statusCode: 400,
      message: '2FA не настроена',
    })
  }

  const isVerified = confirmTwoFaCode(code, user.twoFaSecret)
  
  // ✅ FIX: Удален console.log с секретом!
  // ❌ console.log(isVerified, code, user.twoFaSecret)  // УДАЛЕНО!

  if (!isVerified) {
    await logLoginAttempt(event, identifier, false)
    throw createError({
      statusCode: 401,
      message: 'Неверный код подтверждения',
    })
  }

  // Успешная верификация
  await logLoginAttempt(event, identifier, true)

  return {
    status: true,
  }
})
