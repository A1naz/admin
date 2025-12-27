import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PaymentIntend } from '@/server/lib/models/PaymentIntend'
import { Referral } from '~/server/lib/models/Referral'
import { User } from '~/server/lib/models/User'
import he from 'he'
const limit = 50

async function filterUsers(users: any[]) {
  const foundReferrals = await Referral.find({
    'referrals.user': { $in: users.map((user: any) => user._id) },
  })

  return users.map((user: any) => {
    let isDocumentSigned = false
    let isUserReferral = false

    if (foundReferrals && foundReferrals.length) {
      foundReferrals.find((referral: any) => {
        if (
          referral.referrals.find(
            (ref: any) => ref.user.valueOf() === user._id.valueOf()
          )
        ) {
          isUserReferral = true
        }
      })
    }

    if (user.fizFace) {
      isDocumentSigned = true
    } else if (user.uuidCompany) {
      isDocumentSigned = false
    }
    if (
      user.firstName &&
      user.lastName &&
      user.middleName &&
      user.bik &&
      user.rs
    ) {
      isDocumentSigned = true
    }

    let tariff = 150

    if (
      user.MPTariffs &&
      user.MPTariffs.length &&
      user.MPTariffs[0].prices &&
      user.MPTariffs[0].prices.buyouts &&
      user.MPTariffs[0].prices.buyouts.value
    ) {
      tariff = user.MPTariffs[0].prices.buyouts.value
    }

    return {
      registrationDate: user.registrationDate,
      login: user.username,
      orgName: user.orgName,
      phone: user.phoneNumber,
      email: user.email,
      isUserReferral: isUserReferral ? 'Да' : 'Нет',
      orgInn: user.orgInn,
      orgOgrn: user.orgOgrn,
      isDocumentSigned,
      isDocSigned: user.isDocSigned,
      tariffPrice: tariff,
      faceType: user.uuidCompany
        ? 'работник'
        : user.fizFace
        ? 'Физ.лицо'
        : 'Юр.лицо',
      FIO: user.firstName
        ? user.firstName
        : ' ' + user.middleName
        ? user.middleName
        : ' ' + user.lastName
        ? user.lastName
        : ' ',
      uuid: user.uuid,
      rs: user.bankInfo ? user.bankInfo.rs : '',
      bik: user.bankInfo ? user.bankInfo.bik : '',
      ks: user.bankInfo ? user.bankInfo.ks : '',
      bankName: user.bankInfo ? he.decode(user.bankInfo.name) : '',
      namemini: user.bankInfo ? user.bankInfo.namemini : '',
      index: user.bankInfo ? user.bankInfo.index : '',
      city: user.bankInfo ? user.bankInfo.city : '',
      address: user.bankInfo
        ? user.bankInfo.city + ', ' + user.bankInfo.address
        : '',
      orgPhone: user.bankInfo ? user.bankInfo.phone : '',
      INN: user.orgInn,
      balance: user.balance,
      partnerBalance: user.partner.balance,
      referralsCount: user.partner.refCount,
    }
  })
}

export default {
  async allUsers(
    page: number = 1,
    searchQueryParam: Object = {},
    dateRange: any,
    clientsType: string
  ) {


    const clientsParam =
    clientsType === 'fizFace'
      ? { fizFace: true }
      : clientsType === 'yurFace'
      ? { fizFace: { $ne: true } }
      : {}

    const dateRangeParam: Object = dateRange
      ? {
          registrationDate: {
            $gte: new Date(JSON.parse(dateRange[0])),
            $lte: new Date(JSON.parse(dateRange[1])),
          },
        }
      : {}

    const users = await User.find({
      uuidCompany: { $exists: false },
      ...dateRangeParam,
      ...searchQueryParam,
      ...clientsParam,
    })
      .limit(50)
      .skip(limit * (page - 1))

    if (!users || !users.length) {
      return []
    }

    const format: any = await filterUsers(users)

    return format
  },
  async registeredUsers(
    page: number = 1,
    searchQueryParam: Object = {},
    dateRange: any,
    clientsType: string
  ) {
    const dateRangeParam: Object = dateRange
      ? {
          registrationDate: {
            $gte: new Date(JSON.parse(dateRange[0])),
            $lte: new Date(JSON.parse(dateRange[1])),
          },
        }
      : {}

    const clientsParam =
      clientsType === 'fizFace'
        ? { fizFace: true }
        : clientsType === 'yurFace'
        ? { fizFace: { $ne: true } }
        : {}

    const userIds = await paymenthistory.aggregate([
      {
        $match: {},
      },
      {
        $group: {
          _id: '$user',
        },
      },
    ])

    const users = await User.find({
      uuidCompany: { $exists: false },
      _id: { $nin: userIds.map((user: any) => user._id) },
      ...dateRangeParam,
      ...searchQueryParam,
      ...clientsParam,
    })
      .limit(50)
      .skip(limit * (page - 1))

    if (!users || !users.length) {
      return []
    }

    const format: any = await filterUsers(users)

    return format
  },
  async activeUsers(
    page: number = 1,
    searchQueryParam: Object = {},
    dateRange: any,
    clientsType: string
  ) {
    const curDate = dateRange ? new Date(JSON.parse(dateRange[1])) : new Date()
    const twoWeeksAgo = dateRange
      ? new Date(JSON.parse(dateRange[0]))
      : new Date(curDate.getTime() - 14 * 24 * 60 * 60 * 1000)

      const clientsParam =
      clientsType === 'fizFace'
        ? { fizFace: true }
        : clientsType === 'yurFace'
        ? { fizFace: { $ne: true } }
        : {}
      
    const userIds = await paymenthistory.aggregate([
      {
        $match: {
          dataoperation: {
            $gte: twoWeeksAgo,
          },
        },
      },
      {
        $group: {
          _id: '$user',
        },
      },
    ])

    const users = await User.find({
      uuidCompany: { $exists: false },
      _id: { $in: userIds.map((user: any) => user._id) },
      ...searchQueryParam,
      ...clientsParam
    })
      .limit(50)
      .skip(limit * (page - 1))

    if (!users || !users.length) {
      return []
    }

    const format: any = await filterUsers(users)

    return format
  },
  async inactiveUsers(
    page: number = 1,
    searchQueryParam: Object = {},
    dateRange: any,
    clientsType: string
  ) {
    const curDate = dateRange ? new Date(JSON.parse(dateRange[1])) : new Date()
    const twoWeeksAgo = dateRange
      ? new Date(JSON.parse(dateRange[0]))
      : new Date(curDate.getTime() - 14 * 24 * 60 * 60 * 1000)

    const clientsParam =
      clientsType === 'fizFace'
        ? { fizFace: true }
        : clientsType === 'yurFace'
        ? { fizFace: { $ne: true } }
        : {}

    const userIds = await paymenthistory.aggregate([
      {
        $match: {
          dataoperation: {
            $gte: twoWeeksAgo,
          },
        },
      },
      {
        $group: {
          _id: '$user',
        },
      },
    ])

    const users = await User.find({
      uuidCompany: { $exists: false },
      _id: { $nin: userIds.map((user: any) => user._id) },
      ...searchQueryParam,
      ...clientsParam,
    })
      .limit(50)
      .skip(limit * (page - 1))

    if (!users || !users.length) {
      return []
    }

    const format: any = await filterUsers(users)

    return format
  },
}
