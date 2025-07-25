import { User } from '@/server/lib/models/User'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { phone }: any = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user?.mainAdmin)
    return sendRedirect(event, '/auth', 302)

  const foundConfirmPhone = await ConfirmPhone.findOne({ phone: '+' + phone })

  if (foundConfirmPhone) {
    return { code: foundConfirmPhone.code }
  }

  return { code: 0 }
})
