import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Buyout } from '@/server/lib/models/Buyout'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const body = await readBody(event)
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })

  if (!user)
    return sendRedirect(event, '/auth', 302)

  const found = await Buyout.findOne({ user, uuid: body.uuid })
  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'not found',
    })
  }
  if (found.status === 'paused' || found.status === 'nofunds')
    found.status = 'active'
  await found.save()
  return {
    status: 'ok',
  }
})
