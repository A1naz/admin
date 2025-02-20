import { AdminUser } from '~/server/lib/models/AdminUser'
import { HarmexReferrals } from '~/server/lib/models/HarmexReferrals'
import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'
import mongoose from 'mongoose'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)
  //   const { amount } = await readBody(event)
  const { refId, userId }: any = getQuery(event)
  const foundUser = await User.findOne({ uuid: userId })
  if (!foundUser) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  const foundReferral: any = await HarmexReferrals.findOne({
    'referrals.user': foundUser._id,
  })

  if (!foundReferral) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не является рефералом',
    })
  }

  const filteredReferrals = foundReferral.referrals.filter(
    (referral: any) => referral.user.valueOf() !== foundUser._id.valueOf()
  )
  foundReferral.referrals = filteredReferrals

  const inviter: any = await User.findById(foundReferral.user)
  inviter.partner.refCount = inviter.partner.refCount - 1
  await foundReferral.save()
  await inviter.save()

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 42,
    actionDescription: `Пользователь ${foundUser.uuid} - ${foundUser.username} удален из рефералов пользователя ${inviter.uuid} - ${inviter.username}`,
  })

  return { status: 'ok' }
})
