import { User } from '@/server/lib/models/User'
import { TaskLog as wildberriesTaskLog } from '@/server/lib/models/wildberries/TaskLog'
import { TaskLog as ozonTaskLog } from '@/server/lib/models/ozon/TaskLog'
import { TaskLog as yandexMarketTaskLog } from '@/server/lib/models/yandexMarket/TaskLog'
import { TaskLog as goldAppleTaskLog } from '@/server/lib/models/zy/TaskLog'
import { TaskLog as avitoTaskLog } from '@/server/lib/models/avito/TaskLog'
import { TaskLog as flowwowTaskLog } from '@/server/lib/models/flowwow/TaskLog'
import { TaskLog as sutochnoTaskLog } from '@/server/lib/models/sutochno/TaskLog'
import { getServerSession } from '#auth'
import { AdminUser } from '@/server/lib/models/AdminUser'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !adminUser ||
    (!adminUser.mainAdmin && !adminUser.tabs.includes('управление пользователями платформы'))
  )
    return sendRedirect(event, '/auth', 302)

  const { uuid, mp } = getQuery(event)
  console.log(uuid)
console.log(mp)
  if (!uuid) return []

  let TaskLog
  switch (mp) {
    case 'ozon':
      TaskLog = ozonTaskLog
      break
    case 'yandexMarket':
      TaskLog = yandexMarketTaskLog
      break
    case 'goldApple':
      TaskLog = goldAppleTaskLog
      break
    case 'avito':
      TaskLog = avitoTaskLog
      break
    case 'flowwow':
      TaskLog = flowwowTaskLog
      break
    case 'sutochno':
      TaskLog = sutochnoTaskLog
      break
    case 'wildberries':
    default:
      TaskLog = wildberriesTaskLog
      break
  }

  const all = await TaskLog.find({
    $or: [{ uuid }, { buyoutuuid: uuid }],
  }).sort({ _id: -1 })

  console.log(all)

  return all
})
