import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { PVZTemplate } from '~/server/lib/models/zy/FFPVZTempate'

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

  const { uuid }: any = await readBody(event)

  await PVZTemplate.deleteOne({ uuid })

  return {
    status: 'ok',
  }
})
