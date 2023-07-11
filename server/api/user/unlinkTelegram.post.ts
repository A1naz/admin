import jwt from 'jsonwebtoken'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import mailService from '~/server/lib/mailService'

export default eventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const session = (await getServerSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  if (user.telegramUnlinkEmailSend) {
    const dateSend = new Date(user.telegramUnlinkEmailSend)
    if (Date.now() - dateSend.getTime() < 1000 * 60) {
      throw createError({
        statusCode: 400,
        message: 'Письмо для отвязки уже было отправлено',
      })
    }
  }
  if (!user.email) {
    throw createError({
      statusCode: 400,
      message: 'Привяжите email, чтобы отвязать Telegram',
    })
  }
  const token = jwt.sign(
    { username: user.username, telegram: user.telegram, id: user.id },
    runtimeConfig.SECRET,
    {
      expiresIn: '10m',
    },
  )
  user.telegramUnlinkEmailSend = new Date()
  const url = `${runtimeConfig.PUBLIC_SITE_URL}/api/user/confirmUnlinkTelegram/${token}`
  await mailService.sendUnlinkTelgramMail(user.email, url)
  await user.save()
  return {
    status: 'ok',
  }
})
