import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { Buyout as OzonBuyout } from '~/server/lib/models/ozon/Buyout'

import buyoutsInfo from './buyouts'
import cartsInfo from './cart'
import likeReviewInfo from './likeReview'
import likeProductInfo from './likeProduct'

let paymentPerPage = 50
const obj = {}
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('финансовые операции'))
    return sendRedirect(event, '/auth', 302)
  const { page, filters, sortDate, mp }: any = getQuery(event)

  const trueFilters = JSON.parse(filters)


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

  const users = await User.find({
    _id:
      trueFilters.clients && trueFilters.clients.length
        ? { $in: trueFilters.clients }
        : { $exists: true },
    ...allowedUsersParam,
    ...(
      trueFilters.faceType === 'fizFace'
        ? { fizFace: true } :
        trueFilters.faceType === 'yurFace'
          ? { fizFace: { $ne: true } }
          : {}
    )
  })

  let buyouts: any = []
  if (trueFilters.productName) {
    buyouts = await Buyout.find({
      user: { $in: users },
      'product.name': { $regex: trueFilters.productName, $options: 'i' },
    })
  }


  const histories = await paymenthistory
    .find({
      user: { $in: users },
      ...(mp === 'all'
        ? {} // Без фильтра по полю mp, значит, поле может быть любым или отсутствовать
        : { mp }),
      typeoperations:
        trueFilters.typeoperations === 'any'
          ? { $exists: true }
          : trueFilters.typeoperations,
      type: trueFilters.type === 'any' ? { $exists: true } : trueFilters.type,
      dataoperation: trueFilters.dateRange
        ? {
          $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
          $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
        }
        : { $exists: true },
      basisoperation: buyouts && buyouts.length ?
        {
          $in: [
            ...buyouts.map((buyout: any) => 'Выкуп #' + buyout.uuid),
          ]
        } : { $exists: true },
      ...(trueFilters.article ? {
        article: {
          $in: [
            Number(trueFilters.article),
            trueFilters.article.toString(),
          ]
        }
      } : {})
    })
    .sort({ dataoperation: sortDate })
    .skip(100 * (page - 1))
    .limit(100)

    const formatted = histories.map((h: any) => {
      const user = users.find((user: any) => user._id.equals(h.user))
      
      delete h._doc._id
      return {
        ...h._doc,
        uuid: user ? user.uuid : '',
        email: user ? user.email : '',
        username: user ? user.username : '',
      }
    })
    

  let productsCountInfo = {
    count: 0,
    sum: 0,
  }


  if (
    trueFilters.type === 'buyouts' ||
    trueFilters.type === 'buyouts service'
  ) {
    const info = await buyoutsInfo(
      formatted,
      trueFilters.productName,
      trueFilters.article
    )
  
    const paymentAggregate = await paymenthistory.aggregate([
      {
        $match: {
          mp: mp === 'all' ? { $exists: true } : mp,
          ...allowedUsersParam,
          user:
            trueFilters.clients && trueFilters.clients.length
              ? { $in: users.map((user: any) => user._id) }
              : { $exists: true },
          type: { $in: ['buyouts', 'buyouts service'] },
          dataoperation: trueFilters.dateRange
            ? {
              $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
              $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
            }
            : { $exists: true },
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

    return {
      stats: info,
      statsCount: 999999,
      productsCountInfo,
    }
  } else if (trueFilters.type === 'cart') {
    const info = await cartsInfo(formatted, trueFilters.article)

    return {
      stats: info.sort((a: any, b: any) =>
        sortDate === -1
          ? a.dataoperation - b.dataoperation
          : b.dataoperation - a.dataoperation
      ),
      statsCount: 999999,
      productsCountInfo,
    }
  } else if (trueFilters.type === 'likeReview') {
    const info = await likeReviewInfo(formatted, trueFilters.article)

    return {
      stats: info.sort((a: any, b: any) =>
        sortDate === -1
          ? a.dataoperation - b.dataoperation
          : b.dataoperation - a.dataoperation
      ),
      statsCount: 999999,
      productsCountInfo,
    }
  } else if (trueFilters.type === 'likeProduct') {
    const info = await likeProductInfo(formatted, trueFilters.article)

    return {
      stats: info.sort((a: any, b: any) =>
        sortDate === -1
          ? a.dataoperation - b.dataoperation
          : b.dataoperation - a.dataoperation
      ),
      statsCount: 999999,
      productsCountInfo,
    }
  } else if (trueFilters.type == 'any') {
    const buyouts = []
    const carts = []
    const likeReviews = []
    const likeProducts = []
    const allItems = []

    for (const stat of formatted) {
      if (stat.type == 'buyouts' || stat.type == 'buyouts service') {
        buyouts.push(stat)
      } else if (stat.type == 'cart') {
        carts.push(stat)
      } else if (stat.type == 'likeReview') {
        likeReviews.push(stat)
      } else if (stat.type == 'likeProduct') {
        likeProducts.push(stat)
      } else {
        allItems.push(stat)
      }
    }

    const buyoutsPayment = await buyoutsInfo(
      buyouts,
      trueFilters.productName,
      trueFilters.article
    )

    const cartsPayment = await cartsInfo(carts, trueFilters.article)
    const likeReviewsPayment = await likeReviewInfo(
      likeReviews,
      trueFilters.article
    )
    const likeProductsPayment = await likeProductInfo(
      likeProducts,
      trueFilters.article
    )
    const allItemsPayment = [
      ...allItems,
      ...buyoutsPayment,
      ...cartsPayment,
      ...likeReviewsPayment,
      ...likeProductsPayment,
    ]

    return {
      stats: allItemsPayment.sort((a: any, b: any) =>
        sortDate === -1
          ? a.dataoperation - b.dataoperation
          : b.dataoperation - a.dataoperation
      ),
      statsCount: 999999,
      productsCountInfo,
    }
  }

  return {
    stats: formatted.sort((a: any, b: any) =>
      sortDate === -1
        ? a.dataoperation - b.dataoperation
        : b.dataoperation - a.dataoperation
    ),
    statsCount: 999999,
    productsCountInfo,
  }
})
