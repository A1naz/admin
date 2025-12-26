import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ScreenshotsRequire } from '~/server/lib/models/ScreenshotsRequire'
import { Buyout } from '~/server/lib/models/Buyout'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const runtimeConfig = useRuntimeConfig()
let elPerPage = 10

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('запросы скриншотов')))
    return sendRedirect(event, '/auth', 302)

  const { page, type, account, sortDate, sortDateType, dateRange }: any =
    getQuery(event)

  let trueSortDate: any = {}
  if (typeof sortDateType == 'string') {
    trueSortDate[`${sortDateType}`] = Number(sortDate)
  }

  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      requireDate: {
        $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
        $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
      },
    }
  }

  const typeOperation =
    type == 'any'
      ? {}
      : {
          typeOperation: type,
        }

  // ✅ FIX: Санитизация account для защиты от ReDoS
  const accountOperation =
    account && account.length > 5
      ? {
          account: {
            $regex: sanitizeSearchQuery(account, 100),
            $options: 'i',
          },
        }
      : {}

  const format = await ScreenshotsRequire.find({
    ...typeOperation,
    ...accountOperation,
    ...trueDateRange,
  })
    .sort(trueSortDate)
    .limit(elPerPage)
    .skip((page - 1) * elPerPage)

    await ActionHistory.create({
      adminUser: user._id,
      actionId: 61,
      actionDescription: `Получение скриншотов`,
      date: new Date(),
    })

  return {
    screenshots: format,
  }
})
