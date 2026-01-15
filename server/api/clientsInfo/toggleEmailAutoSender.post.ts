import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'

export default eventHandler(async (event) => {
    const session = (await getServerSession(event)) as any

    if (!session) return sendRedirect(event, '/auth', 302)
  
    const admin = await AdminUser.findOne({ uuid: session.uuid })
  
    if (!admin || (!admin.mainAdmin && !admin.tabs.includes('клиенты')))
      return sendRedirect(event, '/auth', 302)
  const { uuid } = await readBody(event)

  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'UUID is required',
    })
  }

  try {
    const user: any = await User.findOne({ uuid })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Переключаем значение disableEmailAutoSender
    user.disableEmailAutoSender = !user.disableEmailAutoSender
    await user.save()

    return {
      success: true,
      disableEmailAutoSender: user.disableEmailAutoSender,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user',
    })
  }
})
