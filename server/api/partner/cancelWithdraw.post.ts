import { AdminUser } from '~/server/lib/models/AdminUser'
import { Referral } from '~/server/lib/models/Referral'
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
  const { withdrawId }: any = getQuery(event)
  const foundWIthdraw = await PartnerWithdraw.findById(withdrawId)
  if (!foundWIthdraw) {
    throw createError({
      statusCode: 400,
      message: 'Платеж не найден',
    })
  }

  foundWIthdraw.status = 'cancelled'
  ActionHistory.create({
    adminUser: user._id,
    actionId: 43,
    actionDescription: `Платеж с id ${foundWIthdraw._id} был отменен пользователем ${user.uuid} - ${user.username}`,
    date: new Date(),
  })


  if (!foundWIthdraw) {
    throw createError({
      statusCode: 400,
      message: 'Запрос выплаты не найден',
    })
  }

  const userWithdraw = await User.findById(foundWIthdraw.user)
  if (!userWithdraw) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  userWithdraw.partner.balance += foundWIthdraw.amount
  
  await foundWIthdraw.save()
  await userWithdraw.save()

  return { status: 'ok' }
})
