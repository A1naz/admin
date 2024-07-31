import { paymenthistory } from '~/server/lib/models/Paymenthistory'
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
    }
  })
}

export default {
  async registeredUsers(page: number = 1, searchQueryParam: Object = {}) {
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
  async activeUsers(page: number = 1, searchQueryParam: Object = {}) {
    const curDate = new Date()
    const twoWeeksAgo = new Date(curDate.getTime() - 14 * 24 * 60 * 60 * 1000)

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
  async inactiveUsers(page: number = 1, searchQueryParam: Object = {}) {
    const curDate = new Date()
    const twoWeeksAgo = new Date(curDate.getTime() - 14 * 24 * 60 * 60 * 1000)

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
