import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const { amount, card, fio } = await readBody(event)
  if (!amount || !card || !fio) {
    throw createError({
      statusCode: 400,
      message: 'Заполните все данные',
    })
  }
  const balance = user.partner?.balance

  if (!balance || Number(amount) > balance) {
    throw createError({
      statusCode: 400,
      message: 'Сумма вывода не должна быть больше доступного баланса',
    })
  }

  const withdraw = await PartnerWithdraw.create({
    user,
    amount: Number(amount),
    status: 'created',
    type: 'card',
    details: {
      card,
      fio,
    },
  })
  if (withdraw)
    return { status: 'ok', document: withdraw }
  else return { status: 'error' }
})
