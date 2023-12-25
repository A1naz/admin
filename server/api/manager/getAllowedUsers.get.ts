import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { User } from '~/server/lib/models/User'
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { uuid }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin || !userAdmin.mainAdmin) return

  const adminWithAllowedUsers = await AdminUser.findOne({ uuid: uuid })

  if (!adminWithAllowedUsers) {
    return {
      allowedUsers: [],
      restrickedUsers: [],
    }
  }

  const restrictedUsersId = adminWithAllowedUsers.restrictedUsers
  const allowedUsersId = adminWithAllowedUsers.allowedUsers

  const users = await User.find({
    _id: {
      $in: allowedUsersId,
    },
  })

  const restrickedUsers = await User.find({
    _id: {
      $in: restrictedUsersId,
    },
  })

  const format = users.map((user: any) => {
    return {
      _id: user._id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      telegram: user.telegram || '',
      isBanned: user.isBanned ? user.isBanned : false,
      roles: user.roles,
      registrationDate: user.registrationDate,
      tabs: user.tabs ? user.tabs : [],
      tariffs: user.tariff,
      isSelected: true,
    }
  })

  const restrickedFormat = restrickedUsers.map((user: any) => {
    return {
      _id: user._id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      telegram: user.telegram || '',
      isBanned: user.isBanned ? user.isBanned : false,
      roles: user.roles,
      registrationDate: user.registrationDate,
      tabs: user.tabs ? user.tabs : [],
      tariffs: user.tariff,
      isSelected: true,
    }
  })

  return {
    allowedUsers: format,
    restrictedUsers: restrickedFormat,
  }
})
