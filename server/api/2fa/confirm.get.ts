import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { code }: any = getQuery(event)
  
  const isVerified = confirmTwoFaCode(code, user.twoFaSecret)
  console.log(isVerified, code, user.twoFaSecret)
  return {
    status: isVerified,
  }
})
