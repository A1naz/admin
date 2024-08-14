import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PaymentIntend } from '@/server/lib/models/PaymentIntend'
import { User } from '~/server/lib/models/User'
import he from 'he'
const limit = 50

const filterUsers = (users: any[]) => {
  return users.map((user: any) => {
    return {
      registrationDate: user.registrationDate,
      login: user.username,
      orgName: user.orgName,
      phone: user.phoneNumber,
      email: user.email,
      orgInn: user.orgInn,
      orgOgrn: user.orgOgrn,
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
    }
  })
}

export default {
  async registeredUsers(
    page: number = 1,
    searchQueryParam: Object = {},
    dateRange: any
  ) {
    const dateRangeParam: Object = dateRange
      ? {
          registrationDate: {
            $gte: new Date(JSON.parse(dateRange[0])),
            $lte: new Date(JSON.parse(dateRange[1])),
          },
        }
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
      _id: { $nin: userIds.map((user: any) => user._id) },
      ...dateRangeParam,
      ...searchQueryParam,
    })
      .limit(50)
      .skip(limit * (page - 1))

    if (!users || !users.length) {
      return []
    }

    const format: any = filterUsers(users)

    return format
  },
  async activeUsers(
    page: number = 1,
    searchQueryParam: Object = {},
    dateRange: any
  ) {
    const curDate = dateRange ? new Date(JSON.parse(dateRange[1])) : new Date()
    const twoWeeksAgo = dateRange
      ? new Date(JSON.parse(dateRange[0]))
      : new Date(curDate.getTime() - 14 * 24 * 60 * 60 * 1000)

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
      _id: { $in: userIds.map((user: any) => user._id) },
      ...searchQueryParam,
    })
      .limit(50)
      .skip(limit * (page - 1))

    if (!users || !users.length) {
      return []
    }

    const format: any = filterUsers(users)

    return format
  },
  async inactiveUsers(
    page: number = 1,
    searchQueryParam: Object = {},
    dateRange: any
  ) {
    const curDate = dateRange ? new Date(JSON.parse(dateRange[1])) : new Date()
    const twoWeeksAgo = dateRange
      ? new Date(JSON.parse(dateRange[0]))
      : new Date(curDate.getTime() - 14 * 24 * 60 * 60 * 1000)

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
      _id: { $nin: userIds.map((user: any) => user._id) },
      ...searchQueryParam,
    })
      .limit(50)
      .skip(limit * (page - 1))

    if (!users || !users.length) {
      return []
    }

    const format: any = filterUsers(users)

    return format
  },
}
