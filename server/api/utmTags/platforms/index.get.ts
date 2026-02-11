import { UTMPlatform } from '~/server/lib/models/UTMPlatform'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('utm метки')))
    return sendRedirect(event, '/auth', 302)

  const platforms = await UTMPlatform.find().sort({ name: 1 })

  return { platforms }
})

