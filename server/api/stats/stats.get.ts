import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

const runtimeConfig = useRuntimeConfig()

let paymentPerPage = 50
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.roles.includes('admin'))
    return sendRedirect(event, '/auth', 302)

  const { page, filters, sortDate, elPerPage }: any = getQuery(event)
  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin || !userAdmin.roles.includes('admin'))
    return sendRedirect(event, '/auth', 302)
  const trueFilters = JSON.parse(filters)
  if (!trueFilters.sumTo) delete trueFilters.sumTo
  if (!trueFilters.sumFrom) delete trueFilters.sumFrom
  if (elPerPage) {
    paymentPerPage = elPerPage
  }
  let userIds = {}
  if (trueFilters.clients !== null) {
    userIds = { user: { $in: trueFilters.clients } }
  }
  // const users = await User.find({ _id: { $in: trueFilters.clients}})
  // console.log(users);

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
    })
  }

  return {
    stats: format,
    statsCount,
  }
})
