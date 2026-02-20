import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { PVZTemplate } from '~/server/lib/models/yandexMarket/FFPVZTempate'
import { v4 as uuid } from 'uuid'

const usersPerPage = 25

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !userAdmin ||
    (!userAdmin.mainAdmin && !userAdmin.tabs.includes('фулфилмент'))
  )
    return sendRedirect(event, '/auth', 302)

  const { title, pvzs }: any = await readBody(event)

  if (!title || title.length < 3) {
    throw createError({
      message: 'Название шаблона должно быть больше 3-х символов',
      statusCode: 400,
    })
  }

  await PVZTemplate.create({ admin: userAdmin._id, title, pvzsArray: pvzs, uuid: uuid() })

  return {
    status: 'ok',
  }
})
