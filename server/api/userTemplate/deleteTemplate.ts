import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { UserTemplate } from '~/server/lib/models/UserTemplate'
import { AdminUser } from '~/server/lib/models/AdminUser'

const runtimeConfig = useRuntimeConfig()

export default eventHandler(async (event) => {

  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin) return sendRedirect(event, '/auth', 302)

  const { uuid }: any = getQuery(event)

  await UserTemplate.deleteOne({ uuid: uuid })

  return { status: 'ok' }
})
