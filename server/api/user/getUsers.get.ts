import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page, searchValue, sortDate, role }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin) return sendRedirect(event, '/auth', 302)

  let allowedUsersParam = userAdmin.isAllUsersAllowed ? {} : { _id: { $in: userAdmin.allowedUsers.map((id: any) => id) }}
  console.log(allowedUsersParam);
  
  let rolesParam = role ? { roles: { $in: [role] } } : {}
  let allUsers = []

  if (searchValue && searchValue.length > 0) {
    allUsers = await User.find({
      ...allowedUsersParam,
      ...rolesParam,
      $or: [
        { uuid: { $regex: searchValue, $options: 'i' } },
        { email: { $regex: searchValue, $options: 'i' } },
        { telegram: { $regex: searchValue, $options: 'i' } },
        { username: { $regex: searchValue, $options: 'i' } },
      ],
    })
      .skip(usersPerPage * (+page - 1))
      .limit(usersPerPage)
      .sort({ registrationDate: sortDate === 'mdi-arrow-up' ? -1 : 1 })
  } else {
    allUsers = await User.find({
      ...rolesParam,
    ...allowedUsersParam,
    })
      .skip(usersPerPage * (+page - 1))
      .limit(usersPerPage)
      .sort({ registrationDate: sortDate === 'mdi-arrow-up' ? 1 : -1 })
  }
  const usersCount = await User.count()
  const users = allUsers.map((user) => {
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
    }
  })

  return {
    users,
    usersCount,
    status: 'ok',
  }
})
