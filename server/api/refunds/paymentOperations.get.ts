import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.tabs.includes('возвраты средств клиентам') && !user.mainAdmin)
  )
    return sendRedirect(event, '/auth', 302)

  const { operationId } = getQuery(event)

  const operations: any = await paymenthistory.find({
    basisoperation: { $regex: operationId, $options: 'i' },
  })

  const format = operations.map((operation: any) => {
    return {
      _id: operation._id,
      basisoperation: operation.basisoperation,
      date: operation.dataoperation,
      summ: Number(operation.summ),
      selected: false
    }
  })

  return format
})
