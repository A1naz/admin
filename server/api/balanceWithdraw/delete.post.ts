import { AdminUser } from '~~/server/lib/models/AdminUser'
import { BalanceWithdraw } from '~~/server/lib/models/BalanceWithdraw'
import { User } from '~~/server/lib/models/User'
import { getServerSession } from '#auth'
import { requireValidObjectId } from '~/server/utils/validateObjectId'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('вывод с баланса')))
    return sendRedirect(event, '/auth', 302)

  const { id }: any = getQuery(event)
  
  // NoSQL Injection Protection
  requireValidObjectId(id, 'id')
  
  // IDOR Protection: Проверка прав доступа к запросу
  const withdraw = await BalanceWithdraw.findById(id)
  if (!withdraw) {
    throw createError({
      statusCode: 404,
      message: 'Запрос на вывод не найден',
    })
  }

  // Для не-главных админов проверяем доступ к пользователю
  if (!user.mainAdmin) {
    const withdrawUser = await User.findOne({ uuid: withdraw.userUuid })
    if (!withdrawUser) {
      throw createError({
        statusCode: 404,
        message: 'Пользователь не найден',
      })
    }

    // Проверка прав доступа
    if (!user.isAllUsersAllowed && !user.allowedUsers.some((id: any) => id.equals(withdrawUser._id))) {
      throw createError({
        statusCode: 403,
        message: 'Недостаточно прав доступа к этому запросу',
      })
    }

    if (user.restrictedUsers.some((id: any) => id.equals(withdrawUser._id))) {
      throw createError({
        statusCode: 403,
        message: 'Доступ к этому запросу ограничен',
      })
    }
  }

  await BalanceWithdraw.findByIdAndDelete(id)

  return { status: 'ok' }
})
