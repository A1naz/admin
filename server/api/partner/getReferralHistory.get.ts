import { Referral } from '~/server/lib/models/Referral'
import { User } from '~/server/lib/models/User'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ObjectId } from 'mongodb'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { Buyout } from '~/server/lib/models/Buyout'

const elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || !admin.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)

  const { refId, page, sortType, sort }: any = getQuery(event)

  const sortFilter: any = {}
  sortFilter[`${sortType}`] = Number(sort)

  const data = await PartnerPaymentHistory.find({
    referral: new ObjectId(refId),
  })
    .sort(sortFilter)
    .skip(elPerPage * (+page - 1))
    .limit(elPerPage)

  const buyoutIDS = data.map((el: any) =>
    el.serviceType === 'buyouts' ? el.serviceID : null
  )

  const buyouts = await Buyout.find({ _id: { $in: buyoutIDS } })

  const format = data.map((el: any) => {
    if (el.serviceType === 'buyouts') {
      const buyout = buyouts.find(
        (item: any) => item._id.valueOf() === el.serviceID.valueOf()
      )

      return {
        id: el._id,
        serviceID: buyout ? buyout?.uuid : el.serviceID,
        date: el.date,
        amount: el.amount,
        serviceType: el.serviceType,
        description: el.description,
      }
    } else {
      return {
        id: el._id,
        serviceID: el.serviceID,
        date: el.date,
        amount: el.amount,
        serviceType: el.serviceType,
        description: el.description,
      }
    }
  })

  return format
})
