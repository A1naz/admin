import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || !admin.roles.includes('admin'))
    return sendRedirect(event, '/auth', 302)

  const notificationCount = await PartnerWithdraw.count({ status: 'created' })
  return { quantity: notificationCount }
})
