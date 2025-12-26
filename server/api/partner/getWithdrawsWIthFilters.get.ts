import { AdminUser } from '~/server/lib/models/AdminUser'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'
import { getServerSession } from '#auth'
import { ObjectId } from 'mongodb'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const withdrawsPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page, searchValue, filters, sort }: any = getQuery(event)
  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin || !userAdmin.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)

  const allowedUsersParam = userAdmin.isAllUsersAllowed
  ? {
      user: { $nin: userAdmin.restrictedUsers.map((id: any) => id) },
    }
  : {
      $and: [
        { user: { $in: userAdmin.allowedUsers.map((id: any) => id) } },
        { user: { $nin: userAdmin.restrictedUsers.map((id: any) => id) } },
      ],
    }

  const trueFilters = JSON.parse(filters)
  if (!trueFilters.sumTo) delete trueFilters.sumTo
  if (!trueFilters.sumFrom) delete trueFilters.sumFrom

  // ✅ FIX: Санитизация searchValue для защиты от ReDoS
  const safeSearchValue = sanitizeSearchQuery(searchValue || '', 100)

  const withdraws = await PartnerWithdraw.find({
    ...allowedUsersParam,
    amount: {
      $gte: Number(trueFilters.sumFrom) || 0,
      $lte: Number(trueFilters.sumTo) || 999999,
    },
    $or: [
      { _id: ObjectId.isValid(searchValue) ? new ObjectId(searchValue) : null },
      { userUuid: { $regex: safeSearchValue, $options: 'i' } },
      { 'details.fio': { $regex: safeSearchValue, $options: 'i' } },
      { 'details.card': { $regex: safeSearchValue, $options: 'i' } },
    ],
    status:
      trueFilters.status !== 'any' ? trueFilters.status : { $exists: true },
    type: trueFilters.type !== 'any' ? trueFilters.type : { $exists: true },
  })
    .sort(JSON.parse(sort))
    .skip(withdrawsPerPage * (+page - 1))
    .limit(withdrawsPerPage)

  const withdrawsCount = await PartnerWithdraw.count()

  return {
    withdraws,
    withdrawsCount,
  }
})
