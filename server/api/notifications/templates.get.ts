import { NotificationTemplate } from '~/server/lib/models/NotificationTemplate'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('ручные уведомления')))
    return sendRedirect(event, '/auth', 302)


  const foundTemplates = await NotificationTemplate.find({
    admin: user._id,
  })
    .limit(1000)
    .sort({ _id: -1 })

  if (!foundTemplates) return []

  const templateUsers = await User.find({
    _id: { $in: foundTemplates.map((template) => template.users).flat() },
  })

  const usersFormat = templateUsers.map((user: any) => {
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
      tariffs: user.MPTariffs,
      partnerRewardPercent: user.partner?.rewardPercent
        ? user.partner?.rewardPercent
        : 10,
      partnerSecondLevelPercent: user.partner?.secondLevelPercent
        ? user.partner?.secondLevelPercent
        : 5,
      organization: user.fizFace ? user.username + '(Физ. лицо)' : user.orgName,
      partnerServiceRewardSum: user.partner?.partnerServiceRewardSum
        ? user.partner.partnerServiceRewardSum
        : 500,
      partnerRewardType: user.partner?.partnerRewardType
        ? user.partner.partnerRewardType
        : 'service',
    }
  })

  const format = foundTemplates.map((template) => {
    const users = usersFormat.filter((user) =>
      template.users.includes(user._id.valueOf())
    )

    return {
      ...template.toObject(),
      users,
    }
  })

  return format
})
