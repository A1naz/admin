import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { TransactionSearch } from '~/server/lib/models/TransactionSearch'

const runtimeConfig = useRuntimeConfig()
let paymentPerPage = 50
let elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('ошибки финансовых операции')))
    return sendRedirect(event, '/auth', 302)

  const { id }: any = getQuery(event)

  const foundTransaction = await TransactionSearch.findById(id)
  if (!foundTransaction) {
    throw createError({
      statusCode: 400,
      message: 'Транзакция не найдена',
    })
  }

  return {
    status: foundTransaction.status,
  }
})
