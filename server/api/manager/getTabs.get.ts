import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { uuid }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !userAdmin ||
    !userAdmin.roles.includes('manager') ||
    !userAdmin.mainAdmin
  )
    return

  const userWithTabs = await AdminUser.findOne({ uuid: uuid })

  if (!userWithTabs) {
    return { tabs: [] }
  }

  return userWithTabs.tabs && userWithTabs.tabs.length > 0
    ? { tabs: userWithTabs.tabs }
    : { tabs: [] }
})
