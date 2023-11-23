import { Referral } from '~/server/lib/models/Referral'
import { User } from '~/server/lib/models/User'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ObjectId } from 'mongodb'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'

const elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || !admin.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)

  const { userId, page, sortType, sort, searchValue }: any = getQuery(event)

  const ref = await Referral.findOne({ user: new ObjectId(userId) })

  if (!ref) {
    return []
  }

  // const refIds = ref.referrals.map((ref: any) => ref.user)

  const usersPartnerIncomeAgg: any = [
    {
      $match: {
        user: new ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$referral',
        totalSum: { $sum: '$amount' },
        quantity: { $sum: 1 },
      },
    },
  ]

  const usersPartnerIncome = await PartnerPaymentHistory.aggregate(
    usersPartnerIncomeAgg
  )

  if (!usersPartnerIncome || usersPartnerIncome.length < 1) {
    return []
  }

  const users = await User.find({
    _id: { $in: ref.referrals.map((ref: any) => ref.user) },
    $or: [
      { uuid: { $regex: searchValue, $options: 'i' } },
      { email: { $regex: searchValue, $options: 'i' } },
      { telegram: { $regex: searchValue, $options: 'i' } },
      { username: { $regex: searchValue, $options: 'i' } },
    ],
  })

  const usersFormat = users.map((user: any) => {
    const userPartnerIncome = usersPartnerIncome.find(
      (u: any) => u._id.valueOf() === user._id.valueOf()
    )
    return {
      _id: user._id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      telegram: user.telegram,
      refCount: user.partner.refCount,
      rewardPercent: user.partner.rewardPercent,
      registrationDate: user.registrationDate,
      totalSum: userPartnerIncome?.totalSum ? userPartnerIncome.totalSum : 0,
      quantity: userPartnerIncome?.quantity ? userPartnerIncome.quantity : 0,
    }
  })

let sortedData: any = []
if (sort == '-1') {
 sortedData = usersFormat.sort((a: any, b: any) => b[sortType] - a[sortType])
} else {
  sortedData = usersFormat.sort((a: any, b: any) => a[sortType] - b[sortType])
}


  return sortedData.slice((Number(page) - 1) * elPerPage, Number(page) * elPerPage)
})
