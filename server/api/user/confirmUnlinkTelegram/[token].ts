import jwt from 'jsonwebtoken'
import { User } from '@/server/lib/models/User'

export default eventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const params = event.context.params

  if (!params?.token) {
    throw createError({
      statusCode: 400,
      message: 'Token is not valid',
    })
  }
  try {
    const data: any = jwt.verify(params.token, runtimeConfig.SECRET)

    if (!data) {
      throw createError({
        statusCode: 400,
        message: 'Token is not valid',
      })
    }
    const user = await User.findById(data.id)

    if (!user) {
      throw createError({
        statusCode: 400,
        message: 'User not found',
      })
    }
    if (!user.email) {
      throw createError({
        statusCode: 400,
        message: 'Привяжите email, чтобы отвязать Telegram',
      })
    }
    user.telegramUnlinkEmailSend = undefined
    user.telegram = undefined
    user.telegramUserId = undefined

    await user.save()

    return sendRedirect(event, '/profile', 302)
  }
  catch (e) {
    console.log(e)
    return 'Token is not valid'
  }
})
