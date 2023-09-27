import { AdminUser } from '~/server/lib/models/AdminUser'
import { Referral } from '~/server/lib/models/Referral'
import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'
import mongoose from 'mongoose'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.roles.includes('admin'))
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

  const foundReferral = await Referral.findOne({
    'referrals.user': foundUser._id,
  })

  if (foundReferral) {
    const foundReferralUser: any = await User.findById(foundReferral.user)

    throw createError({
      statusCode: 400,
      message: `Пользователь уже является рефералом пользователя ${foundReferralUser.username}`,
    })
  }

  const inviter = await User.findOne({ uuid: refId })
  if (!inviter) return
  if (inviter.partner) {
    const refCount = inviter?.partner.refCount ?? 0
    inviter.partner.refCount = refCount + 1

    const referralFound = await Referral.findOne({ user: inviter })
    if (referralFound) {
      referralFound.referrals.push({ user: foundUser._id, date: new Date() })
      await referralFound.save()
    } else {
      await Referral.create({
        user: inviter,
        referrals: [{ user: foundUser._id, date: new Date() }],
      })
    }
    await inviter.save()
  }  

  return { status: 'ok' }
})
