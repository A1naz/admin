import crypto from 'crypto'
import validator from 'validator'
import { User } from '@/server/lib/models/User'
import mailService from '@/server/lib/mailService'
import { checkRateLimit, logLoginAttempt } from '~/server/utils/rateLimiter'

export default eventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { email, password, confirmPassword } = await readBody(event)

  if (!validator.isEmail(email)) {
    throw createError({
      statusCode: 400,
      message: 'Email is not valid',
    })
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      message: 'Passwords do not match',
    })
  }

  // Rate limiting для защиты от перебора email
  const identifier = `password_reset_${email.toLowerCase()}`
  const rateLimitCheck = await checkRateLimit(event, identifier)
  if (!rateLimitCheck.allowed) {
    return {
      status: 'ok', // Не раскрываем что лимит превышен
    }
  }

  const found = await User.findOne({ email })

  if (!found) {
    await logLoginAttempt(event, identifier, false)
    return {
      status: 'ok', // Не раскрываем существование user
    }
  }

  // ✅ FIX: НЕ передаем пароль в токене!
  // Генерируем случайный токен
  const resetToken = crypto.randomBytes(32).toString('hex')
  
  // Хешируем для безопасного хранения в БД
  const hashedToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // Сохраняем хешированный токен с временем истечения
  found.passwordResetToken = hashedToken
  found.passwordResetExpires = new Date(Date.now() + 600000) // 10 минут
  found.pendingPassword = password // Временно храним новый пароль
  await found.save()

  const url = `${runtimeConfig.PUBLIC_SITE_URL}/api/user/changePassword/${resetToken}`

  try {
    await mailService.sendChangePasswordMail(
      found.email,
      url,
      found.firstName || found.username,
    )
    await logLoginAttempt(event, identifier, true)
  } catch (error) {
    return {
      status: 'error',
      message: 'Ошибка отправки письма',
    }
  }

  return {
    status: 'ok',
  }
})

