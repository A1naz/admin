import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
import { Types } from 'mongoose'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'
const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page, searchValue, sortDate, role }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin) return sendRedirect(event, '/auth', 302)

  let allowedUsersParam = userAdmin.isAllUsersAllowed
    ? {
        _id: { $nin: userAdmin.restrictedUsers.map((id: any) => id) },
      }
    : {
        $and: [
          { _id: { $in: userAdmin.allowedUsers.map((id: any) => id) } },
          { _id: { $nin: userAdmin.restrictedUsers.map((id: any) => id) } },
        ],
      }

  let rolesParam = role ? { roles: { $in: [role] } } : {}
  let allUsers = []

  if (searchValue && searchValue.length > 0) {
    const cleanedSearchValue = searchValue.trim()
    const isObjectId =
      Types.ObjectId.isValid(cleanedSearchValue) &&
      /^[0-9a-fA-F]{24}$/.test(cleanedSearchValue)

    if (isObjectId) {
      allUsers = await User.find({
        uuidCompany: { $exists: false },
        ...allowedUsersParam,
        ...rolesParam,
        _id: cleanedSearchValue,
      })
        .skip(usersPerPage * (+page - 1))
        .limit(usersPerPage)
        .sort({ registrationDate: sortDate === 'mdi-arrow-up' ? 1 : -1 })
    } else {
      // ✅ FIX: Санитизация для защиты от ReDoS
      const safeSearchValue = sanitizeSearchQuery(cleanedSearchValue, 100)
      
      allUsers = await User.find({
        ...allowedUsersParam,
        ...rolesParam,
        uuidCompany: { $exists: false },
        $or: [
          { uuid: { $regex: safeSearchValue, $options: 'i' } },
          { email: { $regex: safeSearchValue, $options: 'i' } },
          { telegram: { $regex: safeSearchValue, $options: 'i' } },
          { username: { $regex: safeSearchValue, $options: 'i' } },
          { orgInn: { $regex: safeSearchValue, $options: 'i' } },
          { orgName: { $regex: safeSearchValue, $options: 'i' } },
        ],
      })
        .skip(usersPerPage * (+page - 1))
        .limit(usersPerPage)
        .sort({ registrationDate: sortDate === 'mdi-arrow-up' ? 1 : -1 })
    }
  } else {
    allUsers = await User.find({
      uuidCompany: { $exists: false },
      ...rolesParam,
      ...allowedUsersParam,
    })
      .skip(usersPerPage * (+page - 1))
      .limit(usersPerPage)
      .sort({ registrationDate: sortDate === 'mdi-arrow-up' ? 1 : -1 })
  }
  const usersCount = await User.count({ uuidCompany: { $exists: false } })
  const adminUsers = await AdminUser.find()
  const users = allUsers.map((user: any) => {
    const userTwoFa = adminUsers.find(
      (adminUser: any) => adminUser.uuid === user.uuid
    )

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
      has2FA: !!(userTwoFa?.twoFaSecret || user.twoFaSecret),
      organization: user.fizFace ? user.username + '(Физ. лицо)' : user.orgName,
      partnerServiceRewardSum: user.partner?.partnerServiceRewardSum
        ? user.partner.partnerServiceRewardSum
        : 500,
      partnerRewardType: user.partner?.partnerRewardType
        ? user.partner.partnerRewardType
        : 'service',
    }
  })

  return {
    users,
    usersCount,
    status: 'ok',
  }
})
