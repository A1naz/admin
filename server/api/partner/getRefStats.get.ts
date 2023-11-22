import { Referral } from '~/server/lib/models/Referral'
import { User } from '~/server/lib/models/User'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ObjectId } from 'mongodb'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || !admin.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)

  const { userId, page, sortType, sort }: any = getQuery(event)

  const sortFilter: any = {}
  if (sortFilter == 'totalSum') {
    sortFilter[`${sortType}`] = sort
  }

  const user = await User.findById(userId)

  if (!user) {
    return []
  }

  const refAgg: any = [
    {
      $match: {
        user: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userReferral',
      },
    },
    {
      $unwind: '$referrals', // Развернуть массив referrals
    },
    {
      $lookup: {
        from: 'users',
        localField: 'referrals.user',
        foreignField: '_id',
        as: 'referralUser',
      },
    },
    {
      $project: {
        // "userReferral._id": 1,
        // "userReferral.uuid": 1,
        // "userReferral.username": 1,
        // "userReferral.email": 1,
        // "userReferral.telegram": 1,
        'referralUser._id': 1,
        'referralUser.uuid': 1,
        'referralUser.username': 1,
        'referralUser.email': 1,
        'referralUser.telegram': 1,
        'referralUser.partner': 1,
        'referralUser.registrationDate': 1,
      },
    },
  ]

  if (sortType === 'registrationDate') {
    refAgg.push(
      {
        $sort: {
          'referralUser.registrationDate': Number(sort),
        },
      },
      {
        $skip: (page - 1) * 5,
      },
      {
        $limit: 5,
      }
    )
  }

  const referrals = await Referral.aggregate(refAgg)

  if (!referrals[0]) return []

  const refsInfo: any[] = referrals
    .map((ref: any) => {
      if (ref.referralUser[0] && ref.referralUser[0].username) {
        return {
          _id: ref.referralUser[0]._id,
          username: ref.referralUser[0].username,
          uuid: ref.referralUser[0].uuid,
          email: ref.referralUser[0].email,
          telegram: ref.referralUser[0].telegram,
          refCount: ref.referralUser[0].partner.refCount,
          rewardPercent: ref.referralUser[0].partner.rewardPercent,
          registrationDate: ref.referralUser[0].registrationDate,
        }
      }
      return
    })
    .filter((ref) => ref !== undefined)

  const refsIncomeAgg: any = [
    {
      $match: {
        referral: { $in: refsInfo.map((ref: any) => ref._id) },
      },
    },
    {
      $group: {
        _id: '$referral',
        totalSum: { $sum: '$amount' },
        totalCount: { $sum: 1 },
      },
    },
  ]

  if (sortType === 'totalSum') {
    refsIncomeAgg.splice(2, 0, {
      $sort: {
        totalSum: Number(sort),
      },
    })
    refsIncomeAgg.push(
      {
        $skip: (page - 1) * 5,
      },
      {
      $limit: 5,
    })
  }



  
  const refsIncomeInfo = await PartnerPaymentHistory.aggregate(refsIncomeAgg)
  console.log(refsIncomeInfo);

  const data: any[] = []

  refsInfo.forEach((ref: any) => {
    const refIncome = refsIncomeInfo.find(
      (refIncome: any) => refIncome._id.valueOf() === ref._id.valueOf()
    )

    data.push({
      _id: ref._id,
      username: ref.username,
      uuid: ref.uuid,
      email: ref.email,
      telegram: ref.telegram,
      refCount: ref.refCount,
      totalSum: refIncome ? refIncome.totalSum : 0,
      totalCount: refIncome ? refIncome.totalCount : 0,
      rewardPercent: ref.rewardPercent,
      registrationDate: ref.registrationDate,
      // serviceId: refsIncomeInfo.serviceID,
    })
  })

  data.sort((a: any, b: any) => {
    if (sortType === 'username') {
      if (sort === '-1') {
        return a.username.localeCompare(b.username)
      } else {
        return b.username.localeCompare(a.username)
      }
    }
    if (sortType === 'totalSum') {
      if (sort === '1') {
        return a.totalSum - b.totalSum
      } else {
        return b.totalSum - a.totalSum
      }
    }
  })

  return data
})
