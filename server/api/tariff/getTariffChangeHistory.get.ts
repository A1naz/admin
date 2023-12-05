import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { page } = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const tatiffsChangeHistory = await ActionHistory.find({
    actionId: { $in: [92, 93] },
  })
    .skip((Number(page) - 1) * 50)
    .limit(50)
    .sort({ date: -1 })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 91,
    actionDescription: `Получение истории изменения тарифов`,
    date: new Date(),
  })

  console.log(tatiffsChangeHistory)

  return tatiffsChangeHistory
})
