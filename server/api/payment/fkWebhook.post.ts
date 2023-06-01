import { User } from '@/server/lib/models/User'
import { paymenthistory } from '@/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  try {
    const { AMOUNT, MERCHANT_ID, MERCHANT_ORDER_ID, P_EMAIL } = await readBody(event)
    const user = await User.findOne({ username: MERCHANT_ORDER_ID })
    if (!user)
      return 'NO'

    user.balance += Number(AMOUNT)
    await user.save()
    const history = await paymenthistory.create({
      user,
      summ: Number(AMOUNT),
      typeoperations: 'Приход',
      basisoperation: 'Пополнение баланса через FreeKassa',
      dataoperation: new Date(),
    })
    await history.save()
    return 'YES'
  }
  catch (e) {
    return 'NO'
  }
})
