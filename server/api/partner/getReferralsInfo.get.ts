import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { Referral } from '~/server/lib/models/Referral'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || !admin.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)

  const { userId } = getQuery(event)
  const inviterUser: any = await User.findOne({ uuid: userId })
  const inviter = await Referral.findOne({user: inviterUser._id})
  const ids = inviter?.referrals.map((ref: any) => ref.user)
  const users = await User.find({ _id: { $in: ids } })

  const usersFormat = users.map((user: any) => {
    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
    }
  })

  return usersFormat || []
})
