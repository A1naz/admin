import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || !admin.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)

  const allowedUsersParam = admin.isAllUsersAllowed
  ? {
      user: { $nin: admin.restrictedUsers.map((id: any) => id) },
    }
  : {
      $and: [
        { user: { $in: admin.allowedUsers.map((id: any) => id) } },
        { user: { $nin: admin.restrictedUsers.map((id: any) => id) } },
      ],
    }

  const notificationCount = await PartnerWithdraw.count({
    ...allowedUsersParam,
    status: 'created',
  })

  return { quantity: notificationCount }
})
