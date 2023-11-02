import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'

const runtimeConfig = useRuntimeConfig()

let paymentPerPage = 50
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('финансовые операции'))
    return sendRedirect(event, '/auth', 302)

  const { page, filters, sortDate, elPerPage }: any = getQuery(event)

  const trueFilters = JSON.parse(filters)
  let productsCountInfo = {
    count: 0,
    sum: 0,
  }
  if (!trueFilters.sumTo) delete trueFilters.sumTo
  if (!trueFilters.sumFrom) delete trueFilters.sumFrom
  if (trueFilters.type !== 'buyouts') {
    delete trueFilters.article
  } else if (trueFilters.type == 'buyouts' && trueFilters.article) {
    const buyoutsWithThisArticle = await Buyout.find({
      article: trueFilters.article,
    }).sort({
      createdAt: sortDate,
    })

    const buyoutsUuids: string[] = []

    if (buyoutsWithThisArticle && buyoutsWithThisArticle.length > 0) {
      for (const buyout of buyoutsWithThisArticle) {
        buyoutsUuids.push(`Выкуп #${buyout.uuid}`)
      }
      trueFilters.basisoperation = { basisoperation: { $in: buyoutsUuids } }
    } else {
      return {
        stats: [],
        statsCount: 0,
      }
    }
  }
  if (elPerPage) {
    paymentPerPage = elPerPage
  }
  let userIds = {}
  if (trueFilters.clients !== null) {
    userIds = { user: { $in: trueFilters.clients } }
  }
  // const users = await User.find({ _id: { $in: trueFilters.clients}})

  const trueTypeoperations =
    trueFilters.typeoperations == 'any'
      ? {}
      : { typeoperations: trueFilters.typeoperations }
  const trueType = trueFilters.type == 'any' ? {} : { type: trueFilters.type }
  const trueDateRange = trueFilters.dateRange
    ? {
        dataoperation: {
          $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
          $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
        },
      }
    : {}

  let stats: any = await paymenthistory
    .find({
      ...trueFilters.basisoperation,
      ...userIds,
      ...trueTypeoperations,
      ...trueType,
      ...trueDateRange,
    })
    .sort({
      dataoperation: sortDate,
    })
    .skip(paymentPerPage * (+page - 1))
    .limit(paymentPerPage)

  const statsCount: any = await paymenthistory.count()
  const statsUsersIds: any = stats.map((operation: any) => operation.user)
  const users = await User.find({ _id: { $in: statsUsersIds } })
  const format = <any>[]

  for (const stat of stats) {
    // const user: any = await User.findById(stat.user)
    const user = users.find((user: any) => user._id.equals(stat.user))
    format.push({
      ...stat._doc,
      userUuid: user ? user.uuid : '',
      email: user ? user.email : '',
      username: user ? user.username : '',
      telegram: user ? user.telegram : '',
    })
  }

  if (trueFilters.type == 'buyouts') {
    let buyoutsUuids: string[] = []

    const paymentAggregate = await paymenthistory.aggregate([
      {
        $match: {
          ...trueFilters.basisoperation,
          ...userIds,
          ...trueTypeoperations,
          type: 'buyouts',
          ...trueDateRange,
        },
      },
      {
        $group: {
          _id: 'null',
          sum: { $sum: '$summ' },
          count: { $sum: 1 },
        },
      },
    ])

    if (paymentAggregate && paymentAggregate.length > 0) {
      productsCountInfo = {
        count: paymentAggregate[0].count,
        sum: paymentAggregate[0].sum,
      }
    }

    for (const buyout of format) {
      buyoutsUuids.push(buyout.basisoperation.split(' ')[1].replace('#', ''))
    }

    const buyouts = await Buyout.find({ uuid: { $in: buyoutsUuids } })
    format.forEach((stat: any) => {
      const buyout = buyouts.find(
        (buyout: any) =>
          buyout.uuid == stat.basisoperation.split(' ')[1].replace('#', '')
      )
      stat.article = buyout ? buyout.article : ''
      stat.productName = buyout ? buyout.product.name : ''
    })
  }

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 31,
    actionDescription: `Получение статистики`,
    date: new Date(),
  })

  return {
    stats: format,
    statsCount,
    productsCountInfo
  }
})
