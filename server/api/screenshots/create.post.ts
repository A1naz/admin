import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ScreenshotsRequire } from '~/server/lib/models/ScreenshotsRequire'
import { ActionHistory } from '~/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { typeOperation, account } = await readBody(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('запросы скриншотов')))
    return sendRedirect(event, '/auth', 302)

  await ScreenshotsRequire.create({
    requireDate: new Date(),
    adminUser: user._id,
    typeOperation,
    account,
    status: 'created',
  })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 62,
    actionDescription: `Админ ${user.uuid} - ${user.username} создал запрос на скриншоты`,
    date: new Date(),
  })

  return {
    status: 'ok',
  }
})
