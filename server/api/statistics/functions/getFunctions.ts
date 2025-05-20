import { User } from '~/server/lib/models/User'
import { HarmexReferrals } from '~/server/lib/models/HarmexReferrals'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export async function getRegistrationsInfo(dateQuery: any): Promise<any> {
  const res = {
    allRegistrations: 0,
    selfRegistrations: 0,
    referralRegistrations: 0,
  }

  const usersCount = await User.countDocuments({
    registrationDate: {
      ...dateQuery,
    },
  })
  res.allRegistrations = usersCount
  const allReferrals = await HarmexReferrals.find({})
  let refCount = 0
  allReferrals.forEach((ref: any) => {
    ref.referrals.forEach((referral: any) => {
      if (referral.date < dateQuery.$gte) return
      refCount += 1
    })
  })
  res.referralRegistrations = refCount
  res.selfRegistrations = res.allRegistrations - res.referralRegistrations

  return res
}

export async function getTurnOverInfo(dateQuery: any, mp: any = {}): Promise<any> {
  const res: any = {
    allTurnover: 0,
    qrTurnover: 0,
    manualTurnover: 0,
    profit: 0,
    expenses: 0,
    allProfitFromServices: 0,
    buyoutsProfit: 0,
    reviewsProfit: 0,
    penaltiesProfit: 0,
  }

  const handleTurnOverSumm = await paymenthistory.aggregate([
    {
      $match: {
        dataoperation: dateQuery,
        typeoperations: 'Приход',
        comment: { $regex: 'Ручное пополнение' },
      },
    },
    {
      $group: {
        _id: null,
        summ: {
          $sum: '$summ',
        },
      },
    },
  ])

  if (handleTurnOverSumm && handleTurnOverSumm.length > 0) {
    res.manualTurnover = handleTurnOverSumm[0].summ
  }

  const qrTurnoverSumm = await paymenthistory.aggregate([
    {
      $match: {
        dataoperation: dateQuery,
        typeoperations: 'Приход',
        comment: { $regex: 'Пополнение ' },
      },
    },
    {
      $group: {
        _id: null,
        summ: {
          $sum: '$summ',
        },
      },
    },
  ])

  if (qrTurnoverSumm && qrTurnoverSumm.length > 0) {
    res.qrTurnover = qrTurnoverSumm[0].summ
  }
  res.allTurnover = res.qrTurnover + res.manualTurnover
  
    const expenses = await paymenthistory.aggregate([
      {
        $match: {
          type: { $in: ['buyouts'] },
          dataoperation: dateQuery,
          ...mp,
        },
      },
      {
        $group: {
          _id: '$service',
          summ: {
            $sum: '$summ',
          },
        },
      },
    ])

    if (expenses && expenses.length > 0 && expenses[0] && expenses[0].summ) {
      res.expenses = expenses[0].summ
    }

    const profitFromBuyouts = await paymenthistory.aggregate([
      {
        $match: {
          type: 'buyouts service',
          dataoperation: dateQuery,
          ...mp,
        },
      },
      {
        $group: {
          _id: null,
          summ: {
            $sum: '$summ',
          },
        },
      },
    ])

    if (
      profitFromBuyouts &&
      profitFromBuyouts.length > 0 &&
      profitFromBuyouts[0] &&
      profitFromBuyouts[0].summ
    ) {
      res.buyoutsProfit = profitFromBuyouts[0].summ
    }

    const reviewsProfit = await paymenthistory.aggregate([
      {
        $match: {
          type: 'review',
          dataoperation: dateQuery,
          ...mp,
        },
      },
      {
        $group: {
          _id: null,
          summ: {
            $sum: '$summ',
          },
        },
      },
    ])

    if (
      reviewsProfit &&
      reviewsProfit.length > 0 &&
      reviewsProfit[0] &&
      reviewsProfit[0].summ
    ) {
      res.reviewsProfit = reviewsProfit[0].summ
    }

    const penaltiesProfit = await paymenthistory.aggregate([
      {
        $match: {
          type: 'deliveryStorage',
          dataoperation: dateQuery,
          ...mp,
        },
      },
      {
        $group: {
          _id: null,
          summ: {
            $sum: '$summ',
          },
        },
      },
    ])

    if (
      penaltiesProfit &&
      penaltiesProfit.length > 0 &&
      penaltiesProfit[0] &&
      penaltiesProfit[0].summ
    ) {
      res.penaltiesProfit = penaltiesProfit[0].summ
    }


    res.allProfitFromServices = res.buyoutsProfit + res.reviewsProfit + res.penaltiesProfit

    res.profit  =  (res.allProfitFromServices / res.allTurnover * 100).toFixed(3)

  return res

}

export async function getServicesCountInfo(dateQuery: any, mp: any = {}): Promise<any> {
  const res = {
    allServicesCount: 0,
    buyoutsCount: 0,
    reviewsCount: 0,
    penaltiesCount: 0,
  }

  console.log('function', mp)

  const servicesCount = await paymenthistory.aggregate([
    {
      $match: {
        type:{ $in: ['buyouts service', 'review', 'deliveryStorage']},
        dataoperation: dateQuery,
        ...mp,
      },
    },
    {
      $group: {
        _id: '$type',
        count: {
          $sum: 1,
        },
      },
    },
  ])

  if (servicesCount && servicesCount.length > 0) {
    servicesCount.forEach((item: any) => {
      if (item._id === 'buyouts service') {
        res.buyoutsCount = item.count
      }
      if (item._id === 'review') {
        res.reviewsCount = item.count
      }
      if (item._id === 'deliveryStorage') {
        res.penaltiesCount = item.count
      }
    })
    res.allServicesCount = res.buyoutsCount + res.reviewsCount + res.penaltiesCount
  }

  return res
}

export async function getBalanceInfo(dateQuery: any): Promise<any> {
  const res = {
    balance: 0,
    partnerBalance: 0,
    paidByPartner: 0
  }

  const balance = await User.aggregate([
    {
      $match: {
      },
    },
    {
      $group: {
        _id: null,
        summ: {
          $sum: '$balance',
        },
      },
    },
  ])

  if (
    balance &&
    balance.length > 0 &&
    balance[0] &&
    balance[0].summ
  ) {
    res.balance = balance[0].summ
  }
  
  const partnerBalance = await User.aggregate([
    {
      $match: {
      },
    },
    {
      $group: {
        _id: null,
        summ: {
          $sum: '$partner.balance',
        },
      },
    },
  ])


  if (
    partnerBalance &&
    partnerBalance.length > 0 &&
    partnerBalance[0] &&
    partnerBalance[0].summ
  ) {
    res.partnerBalance = partnerBalance[0].summ
  }

  //  const completedPartnerWithdraws = await PartnerWithdraw.aggregate([
  //     {
  //       $match: {
  //         date: dateQuery,
  //         status: 'completed',
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: 'null',
  //         summ: {
  //           $sum: '$amount',
  //         },
  //         quantity: {
  //           $sum: 1, // Подсчет количества записей
  //         },
  //       },
  //     },
  //   ])

  // console.log('completedPartnerWithdraws', completedPartnerWithdraws)
  return res
}
