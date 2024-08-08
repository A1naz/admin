import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PaymentIntend } from '@/server/lib/models/PaymentIntend'
import { User } from '~/server/lib/models/User'
const limit = 50

const filterUsers = (users: any[]) => {
  return users.map((user: any) => {
    return {
      registrationDate: user.registrationDate,
      login: user.username,
      orgName: user.orgName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      orgInn: user.orgInn,
      orgOgrn: user.orgOgrn,
      FIO:
        user.firstName ||
        '' + ' ' + user.middleName ||
        '' + ' ' + user.lastName ||
        ' ',
      uuid: user.uuid,
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
