import { getServerSession } from '#auth'
import { DefaultPrices } from '~/server/lib/models/defaultPrices'
import { AdminUser } from '~/server/lib/models/AdminUser'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const defaultPrices = await DefaultPrices.findOne()
  

  return defaultPrices?.values
})
