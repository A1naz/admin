import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page, searchValue }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin || !userAdmin.roles.includes('admin'))
    return sendRedirect(event, '/auth', 302)

  const allUsers = await AdminUser.find({
    $or: [
      { uuid: { $regex: searchValue, $options: 'i' } },
      { email: { $regex: searchValue, $options: 'i' } },
      { username: { $regex: searchValue, $options: 'i' } },
    ],
  })
    .skip(usersPerPage * (+page - 1))
    .limit(usersPerPage)
  const usersCount = await AdminUser.count()
  const users = allUsers.map((user) => {
    return {
      _id: user._id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  })

  return {
    users,
    usersCount,
    status: 'ok',
  }
})
