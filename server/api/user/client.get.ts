import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  if (!user.partner) {
    user.partner = {
      refCount: 0,
      rewardPercent: 0,
      balance: 0,
    }
    await user.save()
  }
  const client = {
    email: user.email,
    username: user.email === user.username ? undefined : user.username,
    uuid: user.uuid,
    telegram: user.telegram || undefined,
    balance: user.balance,
    firstName: user.firstName,
    lastName: user.lastName,
    hasPassword: !!user.password,
    telegramUserId: user.telegramUserId,
    wbApiKeys: user.wbApiKeys.length ? user.wbApiKeys : [],
    partner: user.partner,
  }
  return {
    client,
    status: 'ok',
  }
})
