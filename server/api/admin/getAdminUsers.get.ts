import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page, searchValue }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })

  // Проверка прав доступа - только super admin может видеть список админов
  if (!userAdmin || !userAdmin.mainAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Недостаточно прав доступа',
    })
  }

  // ✅ FIX: Санитизация searchValue для защиты от ReDoS
  const safeSearchValue = sanitizeSearchQuery(searchValue || '', 100)

  const allUsers = await AdminUser.find({
    $or: [
      { uuid: { $regex: safeSearchValue, $options: 'i' } },
      { email: { $regex: safeSearchValue, $options: 'i' } },
      { username: { $regex: safeSearchValue, $options: 'i' } },
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
