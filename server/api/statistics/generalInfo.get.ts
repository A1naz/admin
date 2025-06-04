import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import {
  getRegistrationsInfo,
  getTurnOverInfo,
  getServicesCountInfo,
  getBalanceInfo,
} from './functions/getFunctions'

async function safeAssign(target: object, fn: () => Promise<object>) {
  try {
    Object.assign(target, await fn())
  } catch (err) {
    console.log(err)
  }
}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('статистика')))
    return sendRedirect(event, '/auth', 302)

  const { date, mp } = getQuery(event)

  const mpQuery = mp && mp !== 'all' ? { mp } : {}
  let dateQuery: any = {
    $gte: new Date(2000, 0, 1),
  }
  const now = new Date()
  const startOfToday = new Date(now.setHours(0, 0, 0, 0))

  switch (date) {
    case 'today': {
      const start = startOfToday
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      dateQuery = { $gte: start, $lt: end }
      break
    }

    case 'yesterday': {
      const start = new Date(startOfToday)
      start.setDate(start.getDate() - 1)
      const end = new Date(startOfToday)
      dateQuery = { $gte: start, $lt: end }
      break
    }

    case 'threeDays': {
      const start = new Date(startOfToday)
      start.setDate(start.getDate() - 2) // сегодня, вчера и позавчера
      const end = new Date(startOfToday)
      end.setDate(end.getDate() + 1)
      dateQuery = { $gte: start, $lt: end }
      break
    }

    case 'week': {
      const start = new Date(startOfToday)
      start.setDate(start.getDate() - 6)
      const end = new Date(startOfToday)
      end.setDate(end.getDate() + 1)
      dateQuery = { $gte: start, $lt: end }
      break
    }

    case 'month': // = thisMonth
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      dateQuery = { $gte: start, $lt: end }
      break
    }

    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 1)
      dateQuery = { $gte: start, $lt: end }
      break
    }

    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear() + 1, 0, 1)
      dateQuery = { $gte: start, $lt: end }
      break
    }

    case 'lastYear': {
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const end = new Date(now.getFullYear(), 0, 1)
      dateQuery = { $gte: start, $lt: end }
      break
    }
  }

  const res = {
    allRegistrations: 0,
    selfRegistrations: 0,
    referralRegistrations: 0,
    allTurnover: 0,
    qrTurnover: 0,
    manualTurnover: 0,
    profit: 0,
    expenses: 0,
    allProfitFromServices: 0,
    buyoutsProfit: 0,
    reviewsProfit: 0,
    penaltiesProfit: 0,
    allServicesCount: 0,
    buyoutsCount: 0,
    reviewsCount: 0,
    penaltiesCount: 0,
    balance: 0,
    partnerBalance: 0,
    paidByPartner: 0,
    nds: 0,
  }

  ///Блок с регистрациями
  await safeAssign(res, () => getRegistrationsInfo(dateQuery))
  ///Блок с оборотом и прибылью с услуг
  await safeAssign(res, () => getTurnOverInfo(dateQuery, mpQuery))
  ///Блок с количеством услуг
  await safeAssign(res, () => getServicesCountInfo(dateQuery, mpQuery))
  //Блок с балансом
  await safeAssign(res, () => getBalanceInfo(dateQuery))

  return res
})
