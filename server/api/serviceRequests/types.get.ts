import { Service } from '~/server/lib/models/Service'
import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('запросы направлений')))
    return sendRedirect(event, '/auth', 302)

  const groupedServices = await Service.aggregate([
    {
      $group: {
        _id: '$type', // Группировка по полю "type"
        services: {
          $push: {
            type: '$type',
            slug: '$slug',
            name: '$name',
          },
        },
      },
    },
  ])

  const format = groupedServices.map((group) => {
    return {
      type: group._id,
      services: group.services,
    }
  })
  return format
})
