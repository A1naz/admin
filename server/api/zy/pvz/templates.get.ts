import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { PVZTemplate } from '~/server/lib/models/zy/FFPVZTempate'
import { getServerSession } from '#auth'
const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin) return sendRedirect(event, '/auth', 302)

  const templates = await PVZTemplate.find({ admin: userAdmin._id })

  if (!templates || !templates.length) return []
  const format = templates.map((template: any) => {
    return {
      uuid: template.uuid,
      title: template.title,
      pvzs: template.pvzsArray,
    }
  })

  return format
})
