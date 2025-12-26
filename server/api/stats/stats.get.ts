import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { Buyout as OzonBuyout } from '~/server/lib/models/ozon/Buyout'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const runtimeConfig = useRuntimeConfig()

let paymentPerPage = 50
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('финансовые операции'))
    return sendRedirect(event, '/auth', 302)

  const allowedUsersParam = user.isAllUsersAllowed
    ? {
        user: { $nin: user.restrictedUsers.map((id: any) => id) },
      }
    : {
        $and: [
          { user: { $in: user.allowedUsers.map((id: any) => id) } },
          { user: { $nin: user.restrictedUsers.map((id: any) => id) } },
        ],
      }

  const { page, filters, sortDate, elPerPage, mp }: any = getQuery(event)

  let productsCountInfo = {
    count: 0,
    sum: 0,
  }
  const trueFilters = JSON.parse(filters)

  let commentRegex = {}
  if (trueFilters.type == 'penalty') {
    commentRegex = {
      comment: { $regex: 'Штраф', $options: 'i' },
    }
  }

  if (!trueFilters.sumTo) delete trueFilters.sumTo
  if (!trueFilters.sumFrom) delete trueFilters.sumFrom

  // ✅ FIX: Санитизация productName для защиты от ReDoS
  const safeProductName = sanitizeSearchQuery(trueFilters.productName || '', 200)

  if (
    trueFilters.productName &&
    trueFilters.type == 'buyouts' &&
    !trueFilters.article
  ) {
    const wildberriesBuyoutsArticles = await Buyout.find({
      'product.name': { $regex: safeProductName, $options: 'i' },
    }).select('article')
    const ozonBuyoutsArticles = await OzonBuyout.find({
      'product.name': { $regex: safeProductName, $options: 'i' },
    }).select('article')
    const allArticles = [...wildberriesBuyoutsArticles, ...ozonBuyoutsArticles]
    trueFilters.article = {
      $in: allArticles.map((article: any) => article.article),
    }
  }

  if (trueFilters.type !== 'buyouts') {
    delete trueFilters.article
  } else if (trueFilters.type == 'buyouts' && trueFilters.article) {
    const wildberriesBuyoutsWithThisArticle = await Buyout.find({
      article: trueFilters.article,
      'product.name': trueFilters.productName
        ? { $regex: safeProductName, $options: 'i' }
        : { $exists: true },
    }).sort({
      createdAt: sortDate,
    })

    const ozonBuyoutsWithThisArticle = await OzonBuyout.find({
      article: trueFilters.article,
      'product.name': trueFilters.productName
        ? { $regex: safeProductName, $options: 'i' }
        : { $exists: true },
    }).sort({
      createdAt: sortDate,
    })

    const buyoutsWithThisArticle = [
      ...wildberriesBuyoutsWithThisArticle,
      ...ozonBuyoutsWithThisArticle,
    ]

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
        productsCountInfo,
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
  const trueType =
    trueFilters.type == 'any' || trueFilters.type == 'penalty'
      ? {}
      : { type: trueFilters.type }
  const trueFaceType =
    trueFilters.faceType == 'any'
      ? {}
      : trueFilters.faceType == 'yurFace'
      ? { numberpp: { $exists: false } }
      : { numberpp: { $exists: true } }
  const trueDateRange = trueFilters.dateRange
    ? {
        dataoperation: {
          $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
          $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
        },
      }
    : {}
  const mpFilter = mp == 'all' ? {} : { mp: mp }

  let stats: any = await paymenthistory
    .find({
      ...mpFilter,
      ...trueFaceType,
      ...commentRegex,
      ...allowedUsersParam,
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

  if (trueFilters.type == 'buyouts' || trueFilters.type == 'any') {
    let buyoutsUuids: string[] = []

    const paymentAggregate = await paymenthistory.aggregate([
      {
        $match: {
          mp: mp == 'all' ? { $exists: true } : mp,
          ...allowedUsersParam,
          ...trueFilters.basisoperation,
          ...userIds,
          ...trueTypeoperations,
          type: { $in: ['buyouts', 'buyouts service'] },
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
      if (
        (buyout.type == 'buyouts' || buyout.type == 'buyouts service') &&
        buyout.basisoperation &&
        buyout.basisoperation.includes('Выкуп #')
      ) {
        buyoutsUuids.push(buyout.basisoperation.split(' ')[1].replace('#', ''))
      }
    }

    const OzonBuyouts = await OzonBuyout.find({
      'product.name': trueFilters.productName
        ? { $regex: trueFilters.productName, $options: 'i' }
        : { $exists: true },
      uuid: { $in: buyoutsUuids },
    })
    const wildberriesBuyouts = await Buyout.find({
      'product.name': trueFilters.productName
        ? { $regex: trueFilters.productName, $options: 'i' }
        : { $exists: true },
      uuid: { $in: buyoutsUuids },
    })

    const buyouts = [...OzonBuyouts, ...wildberriesBuyouts]

    format.forEach((stat: any) => {
      if (
        (stat.type == 'buyouts' || stat.type == 'buyouts service') &&
        stat.basisoperation &&
        stat.basisoperation.split(' ')[1]
      ) {
        const buyout = buyouts.find(
          (buyout: any) =>
            buyout.uuid == stat.basisoperation.split(' ')[1].replace('#', '')
        )
        stat.article = buyout ? buyout.article : ''
        stat.productName = buyout ? buyout.product.name : ''
      }
    })
  }

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 31,
    actionDescription: `Получение статистики`,
    date: new Date(),
  })

  const trueFormat = format.map((el: any) => {
    if (el.type == 'buyouts' || el.type == 'buyouts service') {
      return el
    } else {
      el.article = ''
      return el
    }
  })

  return {
    stats: format,
    statsCount: 999999,
    productsCountInfo,
  }
})
