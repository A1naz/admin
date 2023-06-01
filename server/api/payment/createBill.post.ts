import freekassa from '@/server/lib/freekassa'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const { fkSecret1, fkID } = useRuntimeConfig()
  const { amount } = await readBody(event)
  if (!amount) {
    throw createError({
      statusCode: 400,
      message: 'Укажите сумму платежа',
    })
  }
  const { signature, url } = freekassa({
    m: fkID,
    oa: amount,
    o: user.username,
    currency: 'RUB',
  }, fkSecret1)
  console.log(signature)
  return {
    payUrl: url as string,
    status: 'ok',
  }
})
