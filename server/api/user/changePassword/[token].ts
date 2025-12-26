import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { User } from '@/server/lib/models/User'

export default eventHandler(async (event) => {
  const params = event.context.params

  if (!params?.token) {
    throw createError({
      statusCode: 400,
      message: 'Token is not valid',
    })
  }

  try {
    // ✅ FIX: Хешируем токен для поиска в БД
    const hashedToken = crypto.createHash('sha256')
      .update(params.token)
      .digest('hex')

    // Ищем пользователя по хешированному токену
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      throw createError({
        statusCode: 400,
        message: 'Токен недействителен или истек',
      })
    }

    // Хешируем новый пароль
    const hash = bcrypt.hashSync(user.pendingPassword, 7)

    // Обновляем пароль и очищаем токен
    user.password = hash
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.pendingPassword = undefined
    await user.save()

    return sendRedirect(event, '/auth?passwordChanged=true', 302)
  }
  catch (e) {
    throw createError({
      statusCode: 400,
      message: 'Токен недействителен или истек',
    })
  }
})
