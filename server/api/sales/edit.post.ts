import { getServerSession } from '#auth'
import { AdminUser } from '@/server/lib/models/AdminUser'
import { ActionHistory } from '@/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const { uuid, status }: any = await readBody(event)

  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !adminUser ||
    (!adminUser.mainAdmin && !adminUser.tabs.includes('тарифные планы'))
  )
    return sendRedirect(event, '/auth', 302)

  return {
    status: 'ok',
  }
})
