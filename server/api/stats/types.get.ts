import { User } from '@/server/lib/models/User'

import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
//   const session = (await getServerSession(event)) as any

//   if (!session)
//     return sendRedirect(event, '/auth', 302)
//   const user = await User.findOne({ uuid: session.uuid })
//   if (!user)
//     return sendRedirect(event, '/auth', 302)
return []
  const allPaymentHistories = await paymenthistory.find()
  const types = <any>[]
  const format = allPaymentHistories.map((operation, index) => {
    if (!types.includes(operation.type)) {
      types.push(operation.type)
    }
  })
  return types
})
